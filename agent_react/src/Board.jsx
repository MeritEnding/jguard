import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Board.css";
import Header from './Header';
import axiosInstance from "./api/axiosInstance"; // 🟢 axiosInstance 임포트 추가

const Board = () => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const fetchQuestions = async (page) => {
    try {
      // 🟢 fetch 대신 axiosInstance 사용
      const res = await axiosInstance.get(`/api/questions`, {
        params: { page: page } // 쿼리 파라미터를 params 객체로 전달
      });
      
      const data = res.data; // 🟢 axios는 응답 데이터를 res.data로 제공합니다.
      setQuestions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      console.error("질문 목록 불러오기 실패:", err);
      // 🟢 에러 처리 강화: 403 Forbidden 같은 권한 문제에 대한 사용자 피드백 추가
      if (err.response && err.response.status === 403) {
        alert("게시판 접근 권한이 없습니다. 로그인 후 다시 시도해주세요.");
        navigate('user/login'); // 로그인 페이지로 리다이렉션
      } else if (err.response) {
        console.error("서버 응답 오류:", err.response.data);
      } else if (err.request) {
        console.error("요청을 보냈으나 응답을 받지 못했습니다:", err.request);
      } else {
        console.error("요청 설정 중 오류 발생:", err.message);
      }
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
      // 🟢 페이지 변경 시에도 토큰이 자동으로 포함됩니다.
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
              <td colSpan="3" style={{ textAlign: "center" }}> {/* 🟢 colSpan 수정 */}
                등록된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            questions.map((q, idx) => (
              <tr key={q.id} onClick={() => handleRowClick(q.id)}>
                {/* 현재 페이지의 첫 번째 게시글 번호 계산 */}
                <td>{totalElements - (page * 10 + idx)}</td> 
                <td>{q.subject}
                  {q.answerList && q.answerList.length > 0 && (
                    <span className="answer-count">
                      [{q.answerList.length}] {/* 괄호 추가로 가독성 향상 */}
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
          (i >= page - 3 && i <= page + 3) && ( // 현재 페이지 기준 앞뒤 3페이지씩 보여주기
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