import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Board.css";
import Header from './Header';

const Board = () => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0); // 🔹 추가
  const navigate = useNavigate();

  const fetchQuestions = async (page) => {
    try {
      const res = await fetch(`http://localhost:8080/api/questions?page=${page}`);
      const data = await res.json();
      setQuestions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements); // 🔹 전체 게시글 수 저장
      setPage(data.number);
    } catch (err) {
      console.error("질문 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [page]);

  const handleRowClick = (id) => {
    navigate(`detail/${id}`);
  };

  const registerRowClick = () => {
    navigate("question/create");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchQuestions(newPage);
    }
  };

  return (
    <div className="board-container">
      <Header />
      <h1 className="board-title">전세 상담 게시판</h1>
      <p className="board-description">전세 관련 질문을 공유하고 정보를 나누세요.</p>

      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
       
            <th>작성일시</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                등록된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            questions.map((q, idx) => (
              <tr key={q.id} onClick={() => handleRowClick(q.id)}>
                <td>{totalElements - (page * 10 + idx)}</td> {/* 🔹 역순 번호 */}
                <td>{q.subject}
                  {q.answerList && q.answerList.length > 0 && (
                    <span className="answer-count">
                      {q.answerList.length}
                    </span>
                  )}
                </td>
                <td>{q.createDate || "작성일 없음"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이징 버튼 */}
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          이전
        </button>
        {[...Array(totalPages)].map((_, i) => (
          (i >= page - 3 && i <= page + 3) && (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={i === page ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        ))}
        <span>
          {page + 1} / {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page + 1 >= totalPages}>
          다음
        </button>
      </div>

      <button className="board-register-btn" onClick={registerRowClick}>
        질문 등록하기
      </button>
    </div>
  );
};

export default Board;
