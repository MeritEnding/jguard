// src/components/Board_detail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Board_detail.css";
import axiosInstance from "./api/axiosInstance"; // axiosInstance 경로 확인
import { jwtDecode } from 'jwt-decode'; // ✅ jwt-decode 라이브러리 임포트

const Board_detail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // ✅ 현재 로그인된 사용자 정보를 저장할 상태
  const navigate = useNavigate();

  // ✅ JWT 토큰에서 현재 사용자 정보를 추출하는 헬퍼 함수
  const getCurrentUserFromToken = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        // 토큰의 만료 시간 확인
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log("Access Token 만료됨. 로그아웃 처리.");
          sessionStorage.removeItem("accessToken"); // 만료된 토큰 제거
          return null;
        }
        // 토큰 페이로드에 사용자 이름이 'username' 필드로 있다고 가정
        // 서버에서 어떤 필드로 사용자 이름을 담아주는지 확인하고 수정해야 해요.
        return { username: decodedToken.username };
      } catch (error) {
        console.error("토큰 디코딩 중 오류 발생:", error);
        sessionStorage.removeItem("accessToken"); // 유효하지 않은 토큰 제거
        return null;
      }
    }
    return null;
  };

  // Function to fetch question details and its answers
  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/board/detail/${id}`);
      const data = response.data;
      setQuestion(data);
    } catch (err) {
      console.error("Error fetching board detail:", err);
      if (err.response) {
        const errorMessage =
          err.response.data.message ||
          err.response.data ||
          "질문 상세 정보를 불러오는 데 실패했습니다.";
        setError(`오류: ${errorMessage}`);

        if (err.response.status === 403) {
          alert("이 게시물에 접근할 권한이 없습니다. 로그인 후 다시 시도해주세요.");
          sessionStorage.removeItem("accessToken"); // 403 에러 시 토큰 제거
          navigate("/user/login");
        } else if (err.response.status === 404) {
          setError("질문을 찾을 수 없습니다. 삭제되었거나 존재하지 않는 게시물입니다.");
        }
      } else if (err.request) {
        setError("네트워크 오류: 서버에 연결할 수 없습니다. 다시 시도해 주세요.");
      } else {
        setError(`요청 오류: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data when the component mounts or 'id' changes
  useEffect(() => {
    // ✅ 컴포넌트 마운트 시 현재 로그인된 사용자 정보를 토큰에서 가져와 상태에 저장
    setCurrentUser(getCurrentUserFromToken());
    fetchDetail();
  }, [id, navigate]); // navigate는 useEffect 내부에서 사용되므로 의존성 배열에 포함

  // Handles submitting a new answer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    // ✅ 토큰이 없거나 유효하지 않으면 답변 제출 불가
    if (!currentUser) {
        setSubmitStatus("답변을 등록하려면 로그인해야 합니다.");
        alert("답변을 등록하려면 로그인해야 합니다.");
        navigate("/user/login"); // 로그인 페이지로 리디렉션
        return;
    }

    if (!answerContent.trim()) {
      setSubmitStatus("답변을 입력해주세요.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/answer/create/${id}`, {
        content: answerContent,
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus("답변이 성공적으로 등록되었습니다! 🎉");
        setAnswerContent("");
        fetchDetail(); // Re-fetch to display the newly added answer
      } else {
        throw new Error(`답변 등록 실패: 서버 응답 코드 ${response.status}`);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      if (err.response) {
        const errorMessage =
          err.response.data.message ||
          err.response.data ||
          "알 수 없는 오류가 발생했습니다.";
        setSubmitStatus(`답변 등록 실패: ${errorMessage}`);

        if (err.response.status === 403) {
          alert("답변을 등록할 권한이 없습니다. 로그인 후 다시 시도해주세요.");
          sessionStorage.removeItem("accessToken"); // 403 에러 시 토큰 제거
          navigate("/user/login");
        }
      } else if (err.request) {
        setSubmitStatus("네트워크 오류: 서버에 연결할 수 없습니다.");
      } else {
        setSubmitStatus(`오류 발생: ${err.message}`);
      }
    }
  };

  // 질문 수정 페이지로 이동하는 함수
  const handleModify = () => {
    navigate(`/question/modify/${question.id}`);
  };

  // --- Conditional Rendering for Loading, Error, and No Question States ---
  if (loading) {
    return (
      <div className="board-status-message loading">
        <p>Loading question details...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-status-message error">
        <p>{error}</p>
        <button onClick={fetchDetail} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="board-status-message no-question">
        <p>No question found. It might have been deleted or never existed.</p>
      </div>
    );
  }

  // --- ⭐️ 수정된 인증 로직 부분 ⭐️ ---
  // 현재 로그인된 사용자 (currentUser)와 게시글 작성자 (question.author)의 username을 비교
  console.log("-------------------- 디버깅 시작 --------------------");
  console.log("1. 현재 로그인된 사용자 (from JWT token):", currentUser ? currentUser.username : null);
  console.log("2. API에서 받은 질문 데이터 (question 객체):", question);
  if (question && question.author) {
    console.log("3. 게시글 작성자 이름 (question.author.username):", question.author.username);
  } else {
    console.log("3. 게시글 작성자 정보를 찾을 수 없습니다.");
  }
  console.log("-------------------- 디버깅 끝 --------------------");

  // showModifyButton은 이제 currentUser가 존재하고, question.author도 존재하며,
  // 두 username이 일치할 때만 true가 돼요.
  const showModifyButton =
    currentUser && question.author && currentUser.username === question.author.username;

  // --- Main Content Rendering ---
  return (
    <div className="board-detail-wrapper">
      <div className="board-detail-container">
        {/* Question Header */}
        <header className="question-header">
          <h1 className="question-subject">{question.subject}</h1>
          {question.createDate && (
            <p className="question-meta">
              Posted on:{" "}
              <strong>{new Date(question.createDate).toLocaleDateString()}</strong>
            </p>
          )}
          {/* ⭐️ 수정 버튼 렌더링 부분 ⭐️ */}
          {showModifyButton && (
            <div className="my-3">
              <button
                onClick={handleModify}
                className="btn btn-sm btn-outline-secondary"
              >
                수정
              </button>
            </div>
          )}
        </header>
        {/* Question Body */}
        <section className="question-body">
          <p className="question-content">{question.content}</p>
        </section>
        <hr className="section-divider" />
        {/* Answers Section */}
        <section className="answers-section">
          <h2 className="answers-heading">
            {question.answerList?.length || 0}
            {question.answerList?.length === 1 ? " Answer" : " Answers"}
          </h2>
          {question.answerList && question.answerList.length > 0 ? (
            <ul className="answer-list">
              {question.answerList.map((answer) => (
                <li
                  key={answer.id || answer.createDate}
                  className="answer-item"
                >
                  <p className="answer-content">[{answer.author?.username || ""}] : {answer.content}</p>
                  {answer.createDate && (
                    <span className="answer-meta">
                      Answered on:{" "}
                      {new Date(answer.createDate).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-answers">Be the first to share your insights!</p>
          )}
        </section>
        <hr className="section-divider" />
        {/* Answer Form Section */}
        <section className="answer-form-section">
          <h2 className="answer-form-heading">Submit Your Answer</h2>
          <form onSubmit={handleSubmit} className="answer-form">
            <textarea
              name="content"
              id="answerContent"
              rows="8"
              placeholder="Write your insightful answer here..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              required
              className="answer-textarea"
            ></textarea>
            <button type="submit" className="submit-button">
              Post Your Answer
            </button>
            {submitStatus && (
              <p
                className={`submit-status ${
                  submitStatus.includes("successfully") ? "success" : "error"
                }`}
              >
                {submitStatus}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Board_detail;