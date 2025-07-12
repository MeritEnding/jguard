import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import './Header.css';
import { FaBars, FaTimes } from 'react-icons/fa'; // 모바일 메뉴 아이콘

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // ✨ 현재 경로를 감지하기 위해 추가
    const isLoggedIn = sessionStorage.getItem('accessToken') !== null;

    // ✨ 각 드롭다운 메뉴를 위한 독립적인 상태
    const [isAiServiceMenuOpen, setIsAiServiceMenuOpen] = useState(false);
    const [isFraudLookupMenuOpen, setIsFraudLookupMenuOpen] = useState(false);
    const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false); // ✨ 뉴스 메뉴 상태 추가 (버그 수정)
    const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);

    // ✨ 모바일 메뉴를 위한 상태
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ✨ 페이지 이동 시 모바일 메뉴가 자동으로 닫히도록 설정
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = async () => {
        // ... (기존 로그아웃 로직은 그대로 사용)
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

    // ✨ 모바일 메뉴 토글 함수
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        // ✨ 모바일 메뉴가 열렸을 때를 구분하기 위한 클래스 추가
        <header className={`header-fixed ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            <div className="header-container">
                <div className="header-logo">
                    <Link to="/">JGuard</Link>
                </div>

                {/* ✨ isMobileMenuOpen 상태에 따라 클래스 동적 부여 */}
                <nav className={`main-nav ${isMobileMenuOpen ? 'active' : ''}`}>
                    <ul>
                        <li><Link to="/guide">예방법 가이드</Link></li>

                        {/* AI 서비스 드롭다운 */}
                        <li className="dropdown" onMouseEnter={() => setIsAiServiceMenuOpen(true)} onMouseLeave={() => setIsAiServiceMenuOpen(false)}>
                            <span className="dropdown-toggle">AI 서비스</span>
                            {isAiServiceMenuOpen && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/chatbot">AI 계약서 위험 분석</Link></li>
                                    <li><Link to="/chatbot1">AI 계약 준비수준 진단</Link></li>
                                </ul>
                            )}
                        </li>

                        {/* 내 지역 전세사기 조회 드롭다운 */}
                        <li className="dropdown" onMouseEnter={() => setIsFraudLookupMenuOpen(true)} onMouseLeave={() => setIsFraudLookupMenuOpen(false)}>
                            <span className="dropdown-toggle">지역별 전세사기 조회</span>
                            {isFraudLookupMenuOpen && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/acident_check">우리동네 안심리포트</Link></li>
                                    <li><Link to="/risk_analysis">우리동네 전세사기 위험도 지도</Link></li>
                                    <li><Link to="/FraudCaseLookup">우리동네 전세사기 상세조회</Link></li>
                                    <li><Link to="/property_check">우리동네 정식 중개업소</Link></li>
                                    <li><Link to="/police_check">우리동네 경찰서</Link></li>
                
                                </ul>
                            )}
                        </li>
                        
                        {/* 뉴스 드롭다운 (버그 수정) */}
                        <li className="dropdown" onMouseEnter={() => setIsNewsMenuOpen(true)} onMouseLeave={() => setIsNewsMenuOpen(false)}>
                            <span className="dropdown-toggle">뉴스/알림</span>
                            {isNewsMenuOpen && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/chungbuk_news">충청북도 전세 뉴스</Link></li>
                                    <li><Link to="/news">전체 뉴스</Link></li>
                                </ul>
                            )}
                        </li>
                        
                        <li className="dropdown" onMouseEnter={() => setIsNewsMenuOpen(true)} onMouseLeave={() => setIsNewsMenuOpen(false)}>
                            <span className="dropdown-toggle">전세사기예방 게임</span>
                            {isNewsMenuOpen && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/jprevention_game">전세사기 예방: 사건 서류철</Link></li>
                                    <li><Link to="/contract_inspectorgame">안심부동산: 계약심사관</Link></li>
                                </ul>
                            )}
                        </li>
                        <li><Link to="/board">사기 매물 공유</Link></li>
                        
                   
                                
                            
                            
                        {isLoggedIn && <li><Link to="/mypage">마이페이지</Link></li>}
                    </ul>
                     {/* 모바일 화면에서만 보이는 로그인/로그아웃 버튼 */}
                    <div className="mobile-auth-buttons">
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                        ) : (
                            <Link to='/user/login' className="login-btn">로그인</Link>
                        )}
                    </div>
                </nav>

                <div className="header-util">
                    <div className="auth-buttons">
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                        ) : (
                            <Link to='/user/login' className="login-btn">로그인</Link>
                        )}
                    </div>
                    {/* ✨ 모바일 메뉴 토글 버튼 */}
                    <button className="menu-toggle" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;