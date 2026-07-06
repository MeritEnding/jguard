import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api/userApi';
import './Header.css';
import { FaBars, FaTimes, FaShieldAlt, FaRobot } from 'react-icons/fa';

const NAV_GROUPS = [
    {
        label: 'AI 서비스',
        items: [
            { to: '/chatbot', label: 'AI 챗봇 진단', desc: '대화로 알아보는 내 계약 위험도' },
        ],
    },
    {
        label: '위험 조회',
        items: [
            { to: '/FraudStates', label: '피해 현황 통계', desc: '지도·차트로 보는 피해 통계' },
            { to: '/FraudCaseLookup', label: '내 지역 사기 조회', desc: '우리 동네 사기 이력 확인' },
            { to: '/risk_analysis', label: '전세가율 위험도', desc: '지역별 깡통전세 위험 분석' },
        ],
    },
    {
        label: '뉴스/정보',
        items: [
            { to: '/guide', label: '예방 가이드', desc: '단계별 체크리스트와 트렌드' },
            { to: '/chungbuk_news', label: '지역별 뉴스', desc: '내 지역 전세 소식' },
            { to: '/news', label: '전체 뉴스', desc: '전국 전세사기 최신 뉴스' },
        ],
    },
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = sessionStorage.getItem('accessToken') !== null;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            alert('로그아웃되었습니다.');
        } catch (error) {
            console.error('로그아웃 요청 중 오류 발생:', error);
        } finally {
            sessionStorage.removeItem('accessToken');
            navigate('/user/login');
        }
    };

    return (
        <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-inner">
                <Link to="/" className="brand" aria-label="JGuard 홈으로">
                    <span className="brand-mark"><FaShieldAlt /></span>
                    <span className="brand-name">JGuard</span>
                </Link>

                <nav className="gnb" aria-label="주요 메뉴">
                    <ul>
                        {NAV_GROUPS.map((group) => (
                            <li className="gnb-item has-dropdown" key={group.label}>
                                <span className="gnb-link">{group.label}</span>
                                <div className="dropdown-panel">
                                    {group.items.map((item) => (
                                        <Link to={item.to} className="dropdown-link" key={item.to}>
                                            <strong>{item.label}</strong>
                                            <span>{item.desc}</span>
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                        <li className="gnb-item">
                            <NavLink to="/board" className="gnb-link">커뮤니티</NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <Link to="/chatbot" className="header-cta">
                        <FaRobot /> AI 진단
                    </Link>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="auth-link">로그아웃</button>
                    ) : (
                        <Link to="/user/login" className="auth-link">로그인</Link>
                    )}
                    <button
                        className="menu-toggle"
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                        aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* 모바일 전체 메뉴 */}
            <div className={`mobile-panel ${isMobileMenuOpen ? 'open' : ''}`}>
                {NAV_GROUPS.map((group) => (
                    <div className="mobile-group" key={group.label}>
                        <div className="mobile-group-label">{group.label}</div>
                        {group.items.map((item) => (
                            <Link to={item.to} className="mobile-link" key={item.to}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
                <div className="mobile-group">
                    <div className="mobile-group-label">커뮤니티</div>
                    <Link to="/board" className="mobile-link">사기 매물 공유</Link>
                </div>
                <div className="mobile-auth">
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="btn btn-outline">로그아웃</button>
                    ) : (
                        <Link to="/user/login" className="btn btn-primary">로그인</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
