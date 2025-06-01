// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-container">
        {/* 로고 영역 */}
        <div className="header-logo">
          <Link to="/">홈</Link> {/* 'kakao' 대신 '홈' 또는 서비스명으로 변경 가능 */}
        </div>

        {/* 메인 메뉴 영역 - Home 컴포넌트의 버튼들을 이곳으로 옮깁니다 */}
        <nav className="main-nav">
          <ul>
            <li><Link to="/chatbot">전세 리스크 진단</Link></li>
            <li><Link to="/guide">예방법 가이드</Link></li>
            <li><Link to="/board">상담 게시판</Link></li>
            <li><Link to="/news">뉴스 및 알림</Link></li>
            <li><Link to="/mypage">마이페이지</Link></li>
            {/* 필요하다면 다른 메뉴 항목도 여기에 추가할 수 있습니다. */}
            {/* 예시: <li><Link to="/about">서비스 소개</Link></li> */}
          </ul>
        </nav>

        {/* 유틸리티 메뉴/아이콘 영역 (필요 없으면 삭제 가능) */}
        <div className="header-util">
          <ul>
            <li><button className="icon-button">Q</button></li> {/* 검색 아이콘 (텍스트 예시) */}
            <li><button className="icon-button">⚙</button></li> {/* 설정 아이콘 (텍스트 예시) */}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;