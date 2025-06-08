import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './api/axiosInstance'; // api 폴더가 components 폴더와 같은 레벨에 있다고 가정
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('accessToken') !== null;

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      await axiosInstance.post('/logout');
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 요청 중 오류 발생:', error);
      // 사용자 경험을 위해 서버 요청 실패 시에도 클라이언트에서는 로그아웃 처리
      alert('로그아웃 처리 중 오류가 발생했으나, 클라이언트에서 로그아웃합니다.');
    } finally {
      // 중요: 요청 성공/실패 여부와 관계없이 세션 스토리지에서 토큰을 제거
      sessionStorage.removeItem('accessToken');
      // 로그아웃 후 로그인 페이지로 이동 (절대 경로로 수정)
      navigate('/user/login'); 
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">홈</Link>
        </div>

        {/* --- ✅ 다른 사이트/메뉴 링크 복원 --- */}
        <nav className="main-nav">
          <ul>
            <li><Link to="/chatbot">전세 리스크 진단</Link></li>
            <li><Link to="/guide">예방법 가이드</Link></li>
            <li><Link to="/board">상담 게시판</Link></li>
            <li><Link to="/news">뉴스 및 알림</Link></li>
            {/* 로그인 상태일 때만 마이페이지 메뉴를 보여줍니다. */}
            {isLoggedIn && <li><Link to="/mypage">마이페이지</Link></li>}
          </ul>
        </nav>
        {/* --- ✅ 복원 완료 --- */}

        <div className="header-util">
          {/* 유틸리티 아이콘 메뉴가 필요하다면 여기에 추가 */}
          <div className="login-button">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            ) : (
              // 로그인 링크 경로 일관성 유지
              <Link to='/user/login'>로그인</Link> 
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;