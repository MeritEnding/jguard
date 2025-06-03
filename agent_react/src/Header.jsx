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
          <Link to="/">홈</Link>
        </div>

        {/* 메인 메뉴 영역 */}
        <nav className="main-nav">
          <ul>
            <li><Link to="/chatbot">전세 리스크 진단</Link></li>
            <li><Link to="/guide">예방법 가이드</Link></li>
            <li><Link to="/board">상담 게시판</Link></li>
            <li><Link to="/news">뉴스 및 알림</Link></li>
            <li><Link to="/mypage">마이페이지</Link></li>
            {/* 추가 메뉴 항목 가능 */}
          </ul>
        </nav>

        {/* 유틸리티 메뉴 + 로그인 버튼 */}
        <div className="header-util">
          <ul className="icon-menu">
            <li><button className="icon-button">Q</button></li>
            <li><button className="icon-button">⚙</button></li>
          </ul>
          <div className="login-button">
            <Link to='/user/login'>로그인</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
