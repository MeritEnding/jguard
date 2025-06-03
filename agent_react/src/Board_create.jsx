import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Board.css";

const Board_create = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/question/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, content }),
      });

      if (!response.ok) {
        throw new Error("질문 등록 실패");
      }

      setSubmitStatus("질문이 등록되었습니다.");
      // 질문 등록 후 목록 페이지로 이동
      navigate("/board");
    } catch (err) {
      setSubmitStatus("등록 중 오류가 발생했습니다.");
      console.error(err);
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

export default Board_create;
