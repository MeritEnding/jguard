import React from "react";
import aiImage from './assets/ai_ill1.png';
import { useNavigate } from "react-router-dom";
// Note: We're assuming App.css is globally imported (e.g., in index.js or App.js).
// If Home.css still contains specific styles not merged into App.css, keep this line.
// Otherwise, it can be removed for cleaner project structure.
import Header from './Header';

const Home = () => {
    const navigate = useNavigate();

    return (
        // Apply the .home-container class to the main wrapper 
        <div className="home-container">
            {/* 상단 소개 영역 (Hero Section) */}
            <Header></Header>
            <section className="hero-section">
                <h2>“전세사기 진단 아직 안해보셨나요?”</h2>
                <p>
                    모든 전세 고민 해결하시고,<br />무료 AI 진단으로 내 상황을 점검해보세요.
                </p>

                {/* 버튼 그룹 */}
              

                {/* 이미지 영역 */}
                <div className="hero-image-container">
                    <img src={aiImage} alt="AI 상담 일러스트" />
                </div>
            </section>

            {/* 특징 영역 (Features Section) */}
            <section className="features-section">
                <h3>기본 특장점</h3>
                {/* Apply .features-grid to the container holding your Feature components */}
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

                <h3>프리미엄 특장점</h3>
                {/* Apply .features-grid again for the second row of features */}
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
            </section>
        </div>
    );
};

// Feature component - apply the .feature-card class here
const Feature = ({ title, desc }) => {
    return (
        <div className="feature-card">
            <h4>{title}</h4>
            <p>{desc}</p>
        </div>
    );
};

export default Home;