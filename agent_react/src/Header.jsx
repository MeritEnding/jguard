import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './api/axiosInstance'; // api 폴더가 components 폴더와 같은 레벨에 있다고 가정
import './Header.css';


const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = sessionStorage.getItem('accessToken') !== null;

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout');
            alert('로그아웃되었습니다.');
        } catch (error) {
            console.error('로그아웃 요청 중 오류 발생:', error);
            alert('로그아웃 처리 중 오류가 발생했으나, 클라이언트에서 로그아웃합니다.');
        } finally {
            sessionStorage.removeItem('accessToken');
            navigate('/user/login');
        }
    };

    return (
        <header className="header-fixed">
            <div className="header-container">
                <div className="header-logo">
                    <Link to="/">홈</Link>
                </div>

                <nav className="main-nav">
                    <ul>
                        <li><Link to="/search">전세사기 사례</Link></li>
                        <li><Link to="/chatbot">전세 리스크 진단</Link></li>
                        <li><Link to="/guide">예방법 가이드</Link></li>
                        <li><Link to="/board">사기 매물 공유</Link></li>
                        <li><Link to="/news">뉴스 및 알림</Link></li>
                        {isLoggedIn && <li><Link to="/mypage">마이페이지</Link></li>}
                    </ul>
                </nav>

                <div className="header-util">
                    <div className="login-button">
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                        ) : (
                            <Link to='/user/login'>로그인</Link>
                        )}
                    </div>
                    <button className="menu-toggle">☰</button>
                </div>
            </div>
        </header>
    );
};

export default Header;