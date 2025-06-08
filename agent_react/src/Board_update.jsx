// src/components/Board_update.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "./api/axiosInstance"; // ✅ 경로 확인: 현재 폴더 기준으로 상대 경로 조정
// import { jwtDecode } from 'jwt-decode'; // jwtDecode는 더 이상 직접 사용하지 않음 (선택적)

const Board_update = () => {
  const { id } = useParams(); // URL 파라미터에서 게시글 ID 가져오기
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null); // 기존 게시글 정보를 저장 (권한 검증 시 필요)
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true); // 기존 게시글 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [submitStatus, setSubmitStatus] = useState(null);

  // ✅ 토큰 존재 여부만 확인하는 함수
  const isAuthenticated = () => {
    return sessionStorage.getItem("accessToken") !== null;
  };

  // 기존 게시글 정보를 불러오는 함수
  const fetchQuestionDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/board/detail/${id}`);
      const questionData = response.data;
      setQuestion(questionData); // 기존 게시글 정보 저장
      setSubject(questionData.subject);
      setContent(questionData.content);

      // ✅ 여기서 클라이언트 측의 "권한 없음" 초기 리다이렉션을 제거하거나,
      // 백엔드에서 403을 받을 때만 리다이렉션하도록 수정해야 합니다.
      // 일단, 백엔드에서 권한 검증을 완전히 맡길 것이므로, 이 부분은 주석 처리합니다.
      // if (!isAuthenticated() || questionData.author.username !== getCurrentUserFromToken().username) {
      //   alert("이 게시글을 수정할 권한이 없습니다.");
      //   navigate(`/board/detail/${id}`);
      //   return;
      // }

    } catch (err) {
      console.error("Error fetching board detail for update:", err);
      if (err.response) {
        const errorMessage = err.response.data.message || err.response.data || "게시글 정보를 불러오는 데 실패했습니다.";
        setError(`오류: ${errorMessage}`);
        if (err.response.status === 403) {
            alert("이 게시글 정보를 불러올 권한이 없거나, 작성자가 아닙니다. 로그인 후 다시 시도해주세요.");
            sessionStorage.removeItem("accessToken"); // 403 에러 시 토큰 제거
            navigate("/user/login");
        } else if (err.response.status === 404) {
            setError("수정하려는 게시글을 찾을 수 없습니다.");
        }
      } else {
        setError(`네트워크 또는 요청 오류: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 기존 게시글 정보 로드
  useEffect(() => {
    if (id) {
      fetchQuestionDetail();
    } else {
      setError("유효한 게시글 ID가 없습니다.");
      setLoading(false);
    }
  }, [id, navigate]); // 의존성 배열에 id와 navigate 추가

  // 폼 제출 핸들러 (수정 요청)
   const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!isAuthenticated()) {
        alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        setSubmitStatus("로그인이 필요합니다.");
        navigate("/user/login");
        return;
    }

    if (!subject.trim() || !content.trim()) {
      setSubmitStatus("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      // ✅ 백엔드의 컨트롤러 매핑과 일치하도록 URL 확인
      // 예를 들어, 백엔드 QuestionController에 @RequestMapping("/api/question")이 있다면,
      // 여기서는 `/modify/${id}`가 될 것이고, 아니면 `/api/question/modify/${id}`가 됩니다.
      // 현재 백엔드 QuestionController의 @RequestMapping("/api")와 @PostMapping("question/modify/{id}")를 보면
      // `/api/question/modify/{id}`가 맞습니다.
      const response = await axiosInstance.put(`/api/question/modify/${id}`, { // ✅ PUT 요청 유지
        subject,
        content,
      });

      if (response.status === 200) {
        setSubmitStatus("질문이 성공적으로 수정되었습니다! 🎉");
        setTimeout(() => {
          navigate(`/board/detail/${id}`);
        }, 1500);
      } else {
        throw new Error(`질문 수정 실패: 서버 응답 코드 ${response.status}`);
      }
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data.message || err.response.data || "알 수 없는 오류가 발생했습니다.";
        setSubmitStatus(`수정 중 오류가 발생했습니다: ${errorMessage}`);
        console.error("서버 응답 오류:", err.response);

        if (err.response.status === 403) {
          alert("질문 수정 권한이 없습니다. (작성자가 아니거나 권한 부족)");
          sessionStorage.removeItem("accessToken");
          navigate('/user/login');
        } else if (err.response.status === 401) {
            alert("로그인이 필요합니다. 다시 로그인해주세요.");
            sessionStorage.removeItem("accessToken");
            navigate('/user/login');
        }
      } else if (err.request) {
        setSubmitStatus("네트워크 오류: 서버에 연결할 수 없습니다.");
        console.error("네트워크 오류:", err.request);
      } else {
        setSubmitStatus(`오류 발생: ${err.message}`);
        console.error("요청 설정 오류:", err.message);
      }
    }
  };

  // --- Conditional Rendering for Loading, Error, and No Question States ---
  if (loading) {
    return (
      <div className="board-status-message loading">
        <p>Loading question for editing...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-status-message error">
        <p>{error}</p>
        <button onClick={() => navigate('/board')} className="btn btn-secondary">
          게시판으로 돌아가기
        </button>
      </div>
    );
  }

  // 게시글 정보가 없으면, 에러 메시지나 로딩 메시지가 아닐 경우 (e.g. 404가 아니지만 데이터가 없는 경우)
  if (!question) {
    return (
        <div className="board-status-message no-question">
            <p>수정하려는 게시글을 찾을 수 없습니다.</p>
            <button onClick={() => navigate('/board')} className="btn btn-secondary">
              게시판으로 돌아가기
            </button>
        </div>
    );
  }
  
  // 폼 렌더링
  return (
    <div className="board-container">
      <h2>질문 수정</h2>
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

        <button type="submit" className="btn btn-primary my-2">수정하기</button>
        {submitStatus && <p>{submitStatus}</p>}
      </form>
    </div>
  );
};

export default Board_update;