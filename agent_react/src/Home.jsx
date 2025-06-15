import React from "react";
import aiImage from './assets/ai_ill1.png';
import { useNavigate } from "react-router-dom";
// Note: We're assuming App.css is globally imported (e.g., in index.js or App.js).
// If Home.css still contains specific styles not merged into App.css, keep this line.
// Otherwise, it can be removed for cleaner project structure.
import Header from './Header';

const Home = () => {
    const navigate = useNavigate();

    const handleStartChatbot = () => {
        navigate("/chatbot");
    };

    return (
        // .home-container는 이제 단순히 모든 콘텐츠를 포함하는 컨테이너입니다.
        // 실제 전체 너비는 각 섹션에서 제어합니다.
        <div className="home-container"> 
            <Header />

            {/* --- Hero Section (상단 소개 영역) --- */}
            <section className="hero-section">
                {/* hero-section 내부의 콘텐츠를 감싸는 래퍼 (최대 너비 적용) */}
                <div className="content-wrapper hero-content-wrapper"> 
                    <h2 className="hero-title">“전세사기 진단 아직 안해보셨나요?”</h2>
                    <p className="hero-description">
                        모든 전세 고민 해결하시고,<br />무료 AI 진단으로 내 상황을 점검해보세요.
                    </p>

                    {/* 버튼 그룹 */}
                    <div className="button-group">
                        <button className="cta-button primary" onClick={handleStartChatbot}>
                            🚀 무료 AI 진단 시작하기
                        </button>
                        <button className="cta-button secondary" onClick={() => navigate('/guide')}>
                            📚 전세사기 예방법 가이드
                        </button>
                    </div>

                    {/* 이미지 영역 */}
                    <div className="hero-image-container">
                        <img src={aiImage} alt="AI 상담 일러스트" className="hero-image" />
                    </div>
                </div>
            </section>

            {/* --- Features Section (특징 영역) --- */}
            <section className="features-section">
                {/* features-section 내부의 콘텐츠를 감싸는 래퍼 (최대 너비 적용) */}
                <div className="content-wrapper features-content-wrapper"> 
                    <h3 className="section-title">기본 특장점</h3>
                    <div className="features-grid">
                        <Feature
                            title="AI 기반 진단"
                            desc="챗봇이 전세계약 리스크를 분석해드립니다."
                        />
                        <Feature
                            title="게시판"
                            desc="사용자들이 질문을 남기고 정보를 공유할 수 있어요."
                        />
                        <Feature
                            title="예방법 가이드"
                            desc="전세 사기 예방법과 대응 방법을 안내합니다."
                        />
                    </div>

                    <h3 className="section-title">프리미엄 특장점</h3>
                    <div className="features-grid">
                        <Feature
                            title="뉴스/알림"
                            desc="최신 전세 사기 뉴스 및 공지를 확인하세요."
                        />
                        <Feature
                            title="마이페이지"
                            desc="내 진단 기록과 상담 이력을 확인할 수 있어요."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const Feature = ({ title, desc }) => {
    return (
        <div className="feature-card">
            <h4 className="feature-title">{title}</h4>
            <p className="feature-description">{desc}</p>
        </div>
    );
};

export default Home;