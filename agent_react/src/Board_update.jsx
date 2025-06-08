import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Board.css"; // CSS 파일 경로는 프로젝트에 맞게 확인하세요.
import axiosInstance from "./api/axiosInstance"; // 🟢 axiosInstance 임포트 추가

const Board_update = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null); // 새로운 시도 전에 이전 상태 초기화

    try {
      // 🟢 fetch 대신 axiosInstance.post() 사용
      // 'Content-Type': 'application/json' 헤더는 axiosInstance에 기본으로 설정되어 있거나,
      // body에 객체를 직접 전달하면 axios가 자동으로 처리합니다.
      const response = await axiosInstance.post("/api/question/ㅡㅐ", { 
        subject, 
        content 
      });

      // axios는 기본적으로 2xx 응답에 대해 response.ok를 true로 간주합니다.
      // throw new Error를 할 필요 없이, response 객체를 통해 성공 여부 확인
      if (response.status === 200 || response.status === 201) { // 200 OK 또는 201 Created 예상
        setSubmitStatus("질문이 성공적으로 수정되었습니다! 🎉");
        // 질문 등록 후 목록 페이지로 이동
        // 딜레이를 주어 사용자에게 성공 메시지를 보여줄 시간을 줍니다.
        setTimeout(() => {
          navigate("/board");
        }, 1500); // 1.5초 후 이동
      } else {
        // 서버에서 2xx 외의 응답을 보냈을 때 (axios는 이 경우에도 catch 블록으로 가지 않을 수 있음)
        throw new Error(`질문 등록 실패: 서버 응답 코드 ${response.status}`);
      }
    } catch (err) {
      // 🟢 axios 에러 처리 방식에 맞게 수정
      if (err.response) {
        // 서버가 응답했지만 상태 코드가 2xx 범위 밖인 경우
        const errorMessage = err.response.data.message || err.response.data || "알 수 없는 오류가 발생했습니다.";
        setSubmitStatus(`등록 중 오류가 발생했습니다: ${errorMessage}`);
        console.error("서버 응답 오류:", err.response);

        // 403 Forbidden (권한 없음) 에러에 대한 특정 처리
        if (err.response.status === 403) {
            alert("질문 수정 권한이 없습니다. 로그인 후 다시 시도해주세요.");
            navigate('/login'); // 로그인 페이지로 리다이렉션
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 문제 등)
        setSubmitStatus("네트워크 오류: 서버에 연결할 수 없습니다.");
        console.error("네트워크 오류:", err.request);
      } else {
        // 요청 설정 중 발생한 오류
        setSubmitStatus(`오류 발생: ${err.message}`);
        console.error("요청 설정 오류:", err.message);
      }
    }
  };

  return (
    <div className="board-container">
      <h2>질문 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">제목</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
            rows="10"
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary my-2">저장하기</button>
        {submitStatus && <p>{submitStatus}</p>}
      </form>
    </div>
  );
};

export default Board_update;