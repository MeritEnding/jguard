import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🟢 useNavigate 임포트 추가
import "./MyPage.css";
import Header from './Header';
import axiosInstance from "./api/axiosInstance"; // 🟢 axiosInstance 임포트 추가

const Mypage = () => {
  const navigate = useNavigate(); // 🟢 useNavigate 훅 추가
  const [userInfo, setUserInfo] = useState(null); // 초기값을 null로 설정 (로딩 중 상태)
  const [myPosts, setMyPosts] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [loading, setLoading] = useState(true); // 🟢 로딩 상태 추가
  const [error, setError] = useState(null);     // 🟢 에러 상태 추가

  useEffect(() => {
    const fetchMyPageData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. 사용자 정보 불러오기
        // 예시 API 엔드포인트 (백엔드에 맞게 수정 필요)
        const userResponse = await axiosInstance.get("/api/user/me"); 
        setUserInfo(userResponse.data);

        // 2. 내가 작성한 질문 목록 불러오기
        // 예시 API 엔드포인트 (백엔드에 맞게 수정 필요)
        const postsResponse = await axiosInstance.get("/api/user/my-questions");
        setMyPosts(postsResponse.data);

        // 3. 챗봇 상담 내역 불러오기
        // 예시 API 엔드포인트 (백엔드에 맞게 수정 필요)
        // 챗봇 내역이 저장되는 백엔드 API가 따로 있다면 그곳을 호출
        const chatsResponse = await axiosInstance.get("/api/user/my-chats");
        setMyChats(chatsResponse.data);

      } catch (err) {
        console.error("마이페이지 데이터 로드 실패:", err);
        if (err.response) {
          const errorMessage = err.response.data.message || err.response.data || "데이터를 불러오는 데 실패했습니다.";
          setError(`오류: ${errorMessage}`);
          
          // 403 Forbidden (권한 없음) 에러 처리
          if (err.response.status === 403) {
            alert("마이페이지에 접근할 권한이 없습니다. 로그인 후 다시 시도해주세요.");
            navigate('/login'); 
          }
        } else if (err.request) {
          setError("네트워크 오류: 서버에 연결할 수 없습니다.");
        } else {
          setError(`요청 오류: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [navigate]); // 🟢 navigate를 의존성 배열에 추가

  // --- 조건부 렌더링: 로딩, 에러 상태 처리 ---
  if (loading) {
    return (
      <div className="mypage-container">
        <Header />
        <h1 className="mypage-title">마이페이지</h1>
        <p className="loading-message">내 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-container">
        <Header />
        <h1 className="mypage-title">마이페이지</h1>
        <p className="error-message">{error}</p>
        {/* 선택적으로 새로고침 버튼 추가 */}
        <button onClick={() => window.location.reload()} className="btn btn-secondary">다시 시도</button>
      </div>
    );
  }

  // --- 메인 콘텐츠 렌더링 (데이터 로드 성공 시) ---
  return (
    <div className="mypage-container">
      <Header />
      <h1 className="mypage-title">마이페이지</h1>

      <section className="mypage-section">
        <h2>👤 내 정보</h2>
        {userInfo ? (
          <>
            <p><strong>아이디:</strong> {userInfo.username}</p> {/* 🟢 백엔드 필드명에 맞게 수정 */}
            <p><strong>이메일:</strong> {userInfo.email}</p>
            <p><strong>가입일:</strong> {userInfo.joinDate ? new Date(userInfo.joinDate).toLocaleDateString() : 'N/A'}</p> {/* 🟢 날짜 형식화 */}
          </>
        ) : (
          <p>사용자 정보를 불러올 수 없습니다.</p>
        )}
      </section>

      <section className="mypage-section">
        <h2>📝 내가 작성한 질문</h2>
        <ul className="mypage-list">
          {myPosts.length === 0 ? (
            <p>작성한 질문이 없습니다.</p>
          ) : (
            myPosts.map((post) => (
              <li key={post.id}>
                <strong>{post.subject}</strong> <span>({new Date(post.createDate).toLocaleDateString()})</span> {/* 🟢 백엔드 필드명에 맞게 수정 */}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mypage-section">
        <h2>💬 챗봇 상담 내역</h2>
        <ul className="mypage-list">
          {myChats.length === 0 ? (
            <p>상담 내역이 없습니다.</p>
          ) : (
            myChats.map((chat) => (
              <li key={chat.id}>
                <strong>{chat.question}</strong> <span>({new Date(chat.date).toLocaleDateString()})</span> {/* 🟢 백엔드 필드명에 맞게 수정 */}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default Mypage;