import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span className="footer-logo-mark"><FaShieldAlt /></span>
                        <span className="footer-logo-name">JGuard</span>
                    </div>
                    <p className="footer-desc">
                        공공데이터와 AI로 대한민국 모든 세입자의
                        <br />
                        보증금을 지키는 전세사기 예방 플랫폼
                    </p>
                    <p className="footer-helpline">
                        전세피해지원센터 <strong>☎ 1533-8119</strong>
                    </p>
                </div>

                <div className="footer-col">
                    <h4>서비스</h4>
                    <Link to="/risk_check">AI 위험 진단</Link>
                    <Link to="/risk_map">전국 위험지도</Link>
                    <Link to="/FraudStates">피해 현황 통계</Link>
                    <Link to="/FraudCaseLookup">내 지역 사기 조회</Link>
                    <Link to="/risk_analysis">전세가율 위험도</Link>
                </div>

                <div className="footer-col">
                    <h4>정보</h4>
                    <Link to="/guide">예방 가이드</Link>
                    <Link to="/news">전세사기 뉴스</Link>
                    <Link to="/board">사기 매물 공유</Link>
                </div>

                <div className="footer-col">
                    <h4>데이터 출처</h4>
                    <a href="https://www.molit.go.kr" target="_blank" rel="noopener noreferrer">국토교통부</a>
                    <a href="https://www.khug.or.kr" target="_blank" rel="noopener noreferrer">주택도시보증공사(HUG)</a>
                    <a href="https://www.data.go.kr" target="_blank" rel="noopener noreferrer">공공데이터포털</a>
                    <a href="https://rt.molit.go.kr" target="_blank" rel="noopener noreferrer">실거래가 공개시스템</a>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-inner">
                    <p>
                        본 서비스의 위험도 분석은 공공데이터 기반 참고 자료이며, 법적 효력을 갖지 않습니다.
                        중요한 계약 결정 전에는 반드시 전문가와 상담하세요.
                    </p>
                    <p>© {new Date().getFullYear()} JGuard. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
