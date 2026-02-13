import logging
import os
import shutil
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware

from .analysis import analyze_and_report_risk
from .config import ALLOWED_ORIGINS, BASE_DIR, PORT
from .extract import extract_text_from_file
from .regional import load_regional_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TEMP_DIR = BASE_DIR / "temp_files"


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_regional_data()
    yield


app = FastAPI(title="JGuard 전세사기 위험 분석 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_states: dict[str, dict] = {}
active_websocket_connections: dict[str, WebSocket] = {}


@app.post("/initialize_session/")
async def initialize_session_api():
    session_id = str(uuid.uuid4())
    session_states[session_id] = {}
    logger.info("세션 생성: %s", session_id)
    return {"session_id": session_id}


@app.post("/upload_and_analyze/")
async def upload_and_analyze_api(session_id: str, file: UploadFile = File(...)):
    if session_id not in session_states:
        raise HTTPException(status_code=404, detail="Session not found")

    temp_dir = TEMP_DIR / session_id
    os.makedirs(temp_dir, exist_ok=True)
    file_location = temp_dir / (file.filename or "uploaded")

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text_from_file(str(file_location))
        analysis_report = analyze_and_report_risk(resume_text)

        websocket = active_websocket_connections.get(session_id)
        if websocket is None:
            raise HTTPException(
                status_code=500,
                detail="분석은 완료되었으나 웹소켓 연결이 없어 결과를 보낼 수 없습니다.",
            )

        await websocket.send_json({
            "type": "analysis_report",
            "message": analysis_report,
            "session_id": session_id,
        })
        return {"session_id": session_id, "message": "파일 분석 완료."}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("파일 분석 실패 (session=%s)", session_id)
        raise HTTPException(status_code=500, detail=f"파일 업로드 또는 분석 실패: {e}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if session_id not in session_states:
        await websocket.send_json({
            "type": "error",
            "message": "유효하지 않은 세션 ID입니다. 세션을 초기화해주세요.",
        })
        await websocket.close()
        return

    active_websocket_connections[session_id] = websocket
    logger.info("웹소켓 연결: %s", session_id)

    try:
        while True:
            await websocket.receive_text()  # 연결 유지용 대기
    except WebSocketDisconnect:
        logger.info("웹소켓 종료: %s", session_id)
    finally:
        active_websocket_connections.pop(session_id, None)
        session_states.pop(session_id, None)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT)
