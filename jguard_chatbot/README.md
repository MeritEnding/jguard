# JGuard 전세사기 위험 분석 API (FastAPI)

계약서·등기부등본 등 PDF/DOCX 자료를 업로드하면 LLM이 전세사기 위험 분석 보고서를 생성해
웹소켓으로 전달하는 서비스. 프론트엔드의 "AI 문서 분석"(`/chatbot`) 페이지가 사용한다.

## 실행 방법

```bash
cd jguard_chatbot
python -m venv .venv
.venv/Scripts/activate        # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env          # OPENAI_API_KEY 채우기
uvicorn app.main:app --reload --port 8000
```

충북 지역 특화 분석을 쓰려면 `data/README.md`에 적힌 공공데이터 파일을 `data/`에 배치한다
(없어도 일반 분석은 동작).

## 환경변수 (.env)

| 키 | 설명 | 기본값 |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 (필수) | - |
| `OPENAI_MODEL` | 사용할 모델 | `gpt-3.5-turbo` |
| `ALLOWED_ORIGINS` | CORS 허용 오리진 (쉼표 구분) | `http://localhost:3000` |
| `DATA_DIR` | 지역 참고 데이터 디렉터리 | `./data` |
| `PORT` | 서버 포트 | `8000` |

## API 흐름

1. `POST /initialize_session/` → `{ "session_id": "..." }`
2. `WS /ws/{session_id}` 연결 (결과 수신 대기)
3. `POST /upload_and_analyze/?session_id=...` — multipart `file`(PDF/DOCX)
4. 분석이 끝나면 웹소켓으로 수신:
   ```json
   { "type": "analysis_report", "message": "### 1. 자료 요약 ...", "session_id": "..." }
   ```

보고서는 `### 숫자. 제목` 섹션 + `- **항목**: 내용` 불릿 형식의 Markdown이며,
프론트 `Chatbot.jsx`의 `parseReportText`가 이 형식을 그대로 파싱한다.

## 테스트

```bash
pip install pytest
pytest
```
