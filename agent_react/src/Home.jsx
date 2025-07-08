import React from "react";
import aiImage from './assets/ai_ill1.png';
import { useNavigate } from "react-router-dom";
// ✨ FIX: 사용된 모든 아이콘을 react-icons/fa에서 import 합니다.
import { FaRocket, FaBook, FaBrain, FaClipboardList, FaBullhorn, FaUser } from 'react-icons/fa';
import Header from './Header';
import './App.css';

const Home = () => {
    const navigate = useNavigate();

    const handleStartChatbot = () => {
        navigate("/chatbot");
    };

    return (
        <div className="home-container">
            <Header />

            {/* --- Hero Section --- */}
            <section className="hero-section">
                <div className="content-wrapper hero-content-wrapper">
                    <h2 className="hero-title">“전세사기 진단, 아직 안 해보셨나요?”</h2>
                    <p className="hero-description">
                        모든 전세 고민 해결하시고,<br />무료 AI 진단으로 내 상황을 점검해보세요.
                    </p>

                    <div className="button-group">
                        <button className="cta-button primary" onClick={handleStartChatbot}>
                            <FaRocket /> 무료 AI 진단 시작하기
                        </button>
                        <button className="cta-button secondary" onClick={() => navigate('/guide')}>
                            <FaBook /> 전세사기 예방법 가이드
                        </button>
                    </div>

                    <div className="hero-image-container">
                        <img src={aiImage} alt="AI 상담 일러스트" className="hero-image" />
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section className="features-section">
                <div className="content-wrapper features-content-wrapper">
                    <h3 className="section-title">주요 기능</h3>
                    <div className="features-grid">
                        <Feature
                            icon={<FaBrain />}
                            title="AI 기반 위험 진단"
                            desc="간단한 정보 입력으로 전세 계약의 잠재적 리스크를 분석해 드립니다."
                        />
                        <Feature
                            icon={<FaClipboardList />}
                            title="체크리스트 및 가이드"
                            desc="계약 전, 중, 후 단계별로 확인해야 할 사항을 꼼꼼히 안내합니다."
                        />
                         <Feature
                            icon={<FaBullhorn />}
                            title="최신 뉴스/사례 공유"
                            desc="최신 전세 사기 수법과 관련 뉴스를 확인하고 미리 대비하세요."
                        />
                    </div>

                    <h3 className="section-title premium-title">프리미엄 기능</h3>
                    <div className="features-grid">
                        <Feature
                            icon={<FaUser />}
                            title="마이페이지"
                            desc="나의 진단 기록과 상담 이력을 체계적으로 관리할 수 있습니다."
                        />
                        <Feature
                            icon={<span>Q&A</span>}
                            title="커뮤니티"
                            desc="다른 사용자들과 실제 경험과 유용한 정보를 공유해 보세요."
                        />
                        <Feature
                            icon={"💡"}
                            title="대응 전략"
                            desc="문제 발생 시 법적 절차와 대응 방법에 대한 심층 가이드를 제공합니다."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const Feature = ({ icon, title, desc }) => {
    return (
        <div className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h4 className="feature-title">{title}</h4>
            <p className="feature-description">{desc}</p>
        </div>
    );
};

export default Home;