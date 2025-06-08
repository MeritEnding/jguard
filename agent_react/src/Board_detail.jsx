import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Board_detail.css";
import axiosInstance from "./api/axiosInstance";

const Board_detail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const navigate = useNavigate();

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
          navigate("/login");
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
    fetchDetail();
  }, [id, navigate]);

  // Handles submitting a new answer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

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
          navigate("/login");
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

  // 이 부분에서 인증 로직을 제거하여 항상 true가 되도록 변경했습니다.
  // const showModifyButton = question.author && question.author.username === currentUsername;
  // -> question 객체가 존재하면 항상 수정 버튼을 표시
  const showModifyButton = true; // 인증 로직 제거: 항상 true

  // --- Main Content Rendering ---
  return (
    <div className="board-detail-wrapper">
      <div className="board-detail-container">
        {/* Question Header */}
        <header className="question-header">
          <h1 className="question-subject">{question.subject}</h1>
          {question.createDate && (
            <p className="question-meta">
              Posted on: **{new Date(question.createDate).toLocaleDateString()}
              **
            </p>
          )}
          {/* 수정 버튼 추가 부분 (인증 로직 없이 항상 표시) */}
          {showModifyButton && ( // showModifyButton은 이제 항상 true
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
                  <p className="answer-content">{answer.content}</p>
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