import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Board_detail.css";
import axiosInstance from "./api/axiosInstance";
import { jwtDecode } from 'jwt-decode';

// 아이콘 임포트 (예시, 실제 사용 시 적절한 라이브러리 설치 필요)
// 예를 들어, react-icons 사용 시:
// import { FaUser, FaCalendarAlt, FaEye } from 'react-icons/fa';

const Board_detail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const getCurrentUserFromToken = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log("Access Token 만료됨. 로그아웃 처리.");
          sessionStorage.removeItem("accessToken");
          return null;
        }
        return { username: decodedToken.username };
      } catch (error) {
        console.error("토큰 디코딩 중 오류 발생:", error);
        sessionStorage.removeItem("accessToken");
        return null;
      }
    }
    return null;
  };

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
          sessionStorage.removeItem("accessToken");
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

  useEffect(() => {
    setCurrentUser(getCurrentUserFromToken());
    fetchDetail();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!currentUser) {
        setSubmitStatus("답변을 등록하려면 로그인해야 합니다.");
        alert("답변을 등록하려면 로그인해야 합니다.");
        navigate("/user/login");
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
        fetchDetail();
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
          sessionStorage.removeItem("accessToken");
          navigate("/user/login");
        } else if (err.response.status === 401) {
            alert("로그인이 필요합니다. 다시 로그인해주세요.");
            sessionStorage.removeItem("accessToken");
            navigate('/user/login');
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
    if (question && question.id) {
        navigate(`/question/modify/${question.id}`);
    } else {
        alert("수정할 질문 정보를 찾을 수 없습니다.");
    }
  };

  // 질문 삭제 함수
  const handleDelete = async () => {
    if (!currentUser) {
        alert("게시글을 삭제하려면 로그인해야 합니다.");
        navigate("/user/login");
        return;
    }

    if (!window.confirm("정말로 이 질문을 삭제하시겠습니까?")) {
        return;
    }

    try {
        const response = await axiosInstance.delete(`/api/question/delete/${id}`);

        if (response.status === 200) {
            alert("질문이 성공적으로 삭제되었습니다.");
            navigate("/board");
        } else {
            throw new Error(`질문 삭제 실패: 서버 응답 코드 ${response.status}`);
        }
    } catch (err) {
        console.error("Error deleting question:", err);
        if (err.response) {
            const errorMessage =
                err.response.data.message || err.response.data || "알 수 없는 오류가 발생했습니다.";
            alert(`질문 삭제 실패: ${errorMessage}`);

            if (err.response.status === 403) {
                alert("질문 삭제 권한이 없습니다. (작성자가 아니거나 권한 부족)");
                sessionStorage.removeItem("accessToken");
                navigate('/user/login');
            } else if (err.response.status === 401) {
                alert("로그인이 필요합니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("accessToken");
                navigate('/user/login');
            } else if (err.response.status === 404) {
                alert("삭제하려는 질문을 찾을 수 없습니다.");
                navigate("/board");
            }
        } else if (err.request) {
            alert("네트워크 오류: 서버에 연결할 수 없습니다.");
        } else {
            alert(`오류 발생: ${err.message}`);
        }
    }
  };

  // "목록" 버튼 클릭 시 게시판 목록으로 이동
  const handleGoToList = () => {
    navigate("/board");
  };

  if (loading) {
    return (
      <div className="board-status-message loading">
        <p>질문 상세 정보를 불러오는 중...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-status-message error">
        <p>{error}</p>
        <button onClick={fetchDetail} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="board-status-message no-question">
        <p>질문을 찾을 수 없습니다. 삭제되었거나 존재하지 않는 게시물입니다.</p>
      </div>
    );
  }

  const showActionButtons =
    currentUser && question.author && currentUser.username === question.author.username;

  return (
    <div className="board-detail-wrapper">
      <div className="board-detail-container">
        {/* Question Header */}
        <header className="question-header">
          <h1 className="question-subject">{question.subject}</h1>
          <hr className="subject-divider" /> {/* 제목 아래 구분선 추가 */}
          {question.createDate && (
            <div className="question-meta-group"> {/* 메타 정보 그룹화 */}
              <p className="question-meta">
                {/* <FaUser className="meta-icon" /> */} {/* 사용자 아이콘 (옵션) */}
                작성자: <strong>{question.author?.username || "알 수 없음"}</strong>
              </p>
              <p className="question-meta">
                {/* <FaCalendarAlt className="meta-icon" /> */} {/* 달력 아이콘 (옵션) */}
                작성일: <strong>{new Date(question.createDate).toLocaleDateString()}</strong>
              </p>
              {/* 조회수 정보는 현재 question 객체에 없으므로 주석 처리. 필요 시 추가 */}
              {/* <p className="question-meta">
                <FaEye className="meta-icon" /> 조회수: <strong>{question.views || 0}</strong>
              </p> */}
            </div>
          )}

          {/* 수정 및 삭제 버튼 렌더링 부분 */}
          {showActionButtons && (
            <div className="question-action-buttons">
              <button
                onClick={handleModify}
                className="board-action-btn modify"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="board-action-btn delete"
              >
                삭제
              </button>
            </div>
          )}
        </header>

        {/* 첨부파일 섹션 (데이터가 없으므로 임시로 빈 div만 남겨둠) */}
        <div className="attachment-section">
            <p className="attachment-placeholder">첨부파일</p>
        </div>


        {/* Question Body */}
        <section className="question-body-content-area"> {/* 새로운 클래스 적용 */}
          <p className="question-content">{question.content}</p>
        </section>

        <hr className="section-divider" />

        {/* Answers Section */}
        <section className="answers-section">
          <h2 className="answers-heading">
            {question.answerList?.length || 0}
            {question.answerList?.length === 1 ? "개 댓글" : "개의 댓글"}
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
                      답변일:{" "}
                      {new Date(answer.createDate).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-answers">아직 답변이 없습니다. 첫 번째 답변을 달아주세요!</p>
          )}
        </section>
        <hr className="section-divider" />
        {/* Answer Form Section */}
        <section className="answer-form-section">
          <h2 className="answer-form-heading">댓글 달기</h2>
          <form onSubmit={handleSubmit} className="answer-form">
            <textarea
              name="content"
              id="answerContent"
              rows="8"
              placeholder="여기에 답변을 입력하세요..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              required
              className="answer-textarea"
            ></textarea>
            <button type="submit" className="submit-button">
              댓글 등록
            </button>
            {submitStatus && (
              <p
                className={`submit-status ${
                  submitStatus.includes("성공적으로") ? "success" : "error"
                }`}
              >
                {submitStatus}
              </p>
            )}
          </form>
        </section>

        {/* 목록 버튼 추가 */}
        <div className="list-button-container">
            <button onClick={handleGoToList} className="list-button">
                목록
            </button>
        </div>
      </div>
    </div>
  );
};

export default Board_detail;