import React, { useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import "./Board.css";

const Board = () => {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error(err));
  }, []);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = { title, content };

    try {
      const response = await fetch("http://localhost:8080/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      if (response.ok) {
        const saved = await response.json();
        setQuestions([saved, ...questions]); // 새로운 질문을 맨 앞에 추가
        setShowForm(false);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      console.error("질문 등록 실패:", err);
    }
  };

  const handleRowClick = (id) => {
    navigate(`detail/${id}`); 
  };
  
  const registerRowClick = () =>{
    navigate("question/create");
  }

  return (
    <div className="board-container">
      <h1 className="board-title">전세 상담 게시판</h1>
      <p className="board-description">전세 관련 질문을 공유하고 정보를 나누세요.</p>

      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>내용</th>
            <th>작성일시</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                등록된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            questions.map((q, idx) => (
              <tr key={q.id} onClick={() => handleRowClick(q.id)}>
                <td>{questions.length - idx}</td>
                <td>
                  {q.subject}
                </td>
                <td>{q.content}</td>
                <td>{q.createDate || "작성일 없음"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="board-register-btn" onClick={() => registerRowClick()}>
        질문 등록하기
      </button>
    </div>
  );
};

export default Board;
