import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaRobot, FaMapMarkedAlt, FaSearchLocation, FaChartLine,
    FaClipboardCheck, FaBullhorn, FaShieldAlt, FaArrowRight,
    FaExclamationTriangle, FaFileContract, FaUserSecret,
} from 'react-icons/fa';
import './Home.css';

const FEATURES = [
    {
        icon: <FaRobot />,
        title: 'AI 위험 진단',
        desc: '보증금·시세·권리관계 정보를 입력하면 딥러닝 AI가 계약 위험도를 점수로 알려드립니다.',
        to: '/risk_check',
    },
    {
        icon: <FaMapMarkedAlt />,
        title: '전국 위험지도',
        desc: '전국 17개 시도의 위험지수와 피해 현황을 지도와 차트로 한눈에 확인하세요.',
        to: '/risk_map',
    },
    {
        icon: <FaSearchLocation />,
        title: '내 지역 사기 조회',
        desc: '이사 갈 동네에 등록된 사기 사례가 있는지 주소 단위로 조회할 수 있습니다.',
        to: '/FraudCaseLookup',
    },
    {
        icon: <FaChartLine />,
        title: '전세가율 위험 분석',
        desc: '지역별 전세가율 데이터로 깡통전세 위험이 높은 지역을 미리 파악하세요.',
        to: '/risk_analysis',
    },
    {
        icon: <FaClipboardCheck />,
        title: '단계별 예방 가이드',
        desc: '계약 전·중·후 단계별 체크리스트로 빠뜨리기 쉬운 확인 사항을 챙겨드립니다.',
        to: '/guide',
    },
    {
        icon: <FaBullhorn />,
        title: '사기 매물 공유',
        desc: '실제 경험과 의심 매물 정보를 커뮤니티에서 공유하고 함께 예방하세요.',
        to: '/board',
    },
];

const STEPS = [
    {
        no: '01',
        title: '정보 입력',
        desc: '보증금, 매매 시세, 근저당 등 계약 관련 정보를 간단히 입력합니다.',
    },
    {
        no: '02',
        title: 'AI 분석',
        desc: '공공데이터로 학습한 AI가 전세가율·권리관계·지역 위험도를 종합 분석합니다.',
    },
    {
        no: '03',
        title: '리포트 확인',
        desc: '위험 등급과 요인별 진단, 다음에 해야 할 행동 가이드를 받아보세요.',
    },
];

const WARNING_SIGNS = [
    {
        icon: <FaExclamationTriangle />,
        title: '시세와 맞먹는 보증금',
        desc: '전세가율이 80%를 넘으면 집이 경매로 넘어갈 때 보증금을 전부 돌려받기 어렵습니다.',
    },
    {
        icon: <FaFileContract />,
        title: '등기부등본의 근저당',
        desc: '선순위 근저당·가압류가 잡혀 있다면 내 보증금보다 먼저 변제되는 빚이 있다는 뜻입니다.',
    },
    {
        icon: <FaUserSecret />,
        title: '집주인 확인 회피',
        desc: '소유자가 아닌 대리인만 나타나거나 세금 완납 증명을 거부하면 일단 의심해야 합니다.',
    },
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* --- 히어로 --- */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-copy">
                        <span className="hero-badge">
                            <FaShieldAlt /> 전국 17개 시도 공공데이터 기반
                        </span>
                        <h1 className="hero-title">
                            전세사기,
                            <br />
                            계약하기 전에
                            <br />
                            <em>AI로 먼저 확인</em>하세요
                        </h1>
                        <p className="hero-sub">
                            국토교통부·HUG 공공데이터로 학습한 AI가 전세가율, 권리관계,
                            지역 위험도를 종합해 내 계약의 위험 신호를 미리 알려드립니다.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/risk_check')}>
                                <FaRobot /> 무료 AI 진단 시작
                            </button>
                            <button className="btn btn-hero-ghost btn-lg" onClick={() => navigate('/risk_map')}>
                                전국 피해 현황 보기 <FaArrowRight />
                            </button>
                        </div>
                    </div>

                    {/* 진단 리포트 프리뷰 카드 */}
                    <div className="hero-visual" aria-hidden="true">
                        <div className="report-card">
                            <div className="report-head">
                                <span className="report-title">AI 위험 진단 리포트</span>
                                <span className="report-tag">위험</span>
                            </div>
                            <div className="report-score">
                                <div className="score-ring">
                                    <span className="score-num">82</span>
                                    <span className="score-unit">/100</span>
                                </div>
                                <div className="score-desc">
                                    <strong>위험 등급 · 높음</strong>
                                    <span>보증금 미반환 가능성이 높은 계약입니다</span>
                                </div>
                            </div>
                            <div className="report-rows">
                                <div className="report-row">
                                    <span>전세가율</span>
                                    <div className="report-bar"><i style={{ width: '92%' }} className="bar-danger" /></div>
                                    <em>92%</em>
                                </div>
                                <div className="report-row">
                                    <span>선순위 채권</span>
                                    <div className="report-bar"><i style={{ width: '68%' }} className="bar-warn" /></div>
                                    <em>높음</em>
                                </div>
                                <div className="report-row">
                                    <span>지역 위험도</span>
                                    <div className="report-bar"><i style={{ width: '38%' }} className="bar-safe" /></div>
                                    <em>보통</em>
                                </div>
                            </div>
                        </div>
                        <div className="float-chip chip-1">🔔 등기부등본 확인 필요</div>
                        <div className="float-chip chip-2">✅ 보증보험 가입 가능</div>
                    </div>
                </div>

                {/* 통계 스트립 */}
                <div className="hero-stats">
                    <div className="stat">
                        <strong>29,000+</strong>
                        <span>전국 누적 피해 인정 건수</span>
                    </div>
                    <div className="stat">
                        <strong>4.7조 원</strong>
                        <span>HUG 전세보증 사고액(연간)</span>
                    </div>
                    <div className="stat">
                        <strong>17개 시도</strong>
                        <span>전국 단위 데이터 커버리지</span>
                    </div>
                    <div className="stat">
                        <strong>95%+</strong>
                        <span>AI 위험 예측 정확도</span>
                    </div>
                </div>
            </section>

            {/* --- 위험 신호 --- */}
            <section className="signals-section">
                <div className="container">
                    <h2 className="section-title">이런 신호가 보이면 의심하세요</h2>
                    <p className="section-sub">전세사기 피해의 대부분은 계약 전에 막을 수 있었던 신호를 놓치면서 시작됩니다.</p>
                    <div className="signals-grid">
                        {WARNING_SIGNS.map((s) => (
                            <div className="signal-card card" key={s.title}>
                                <div className="signal-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 주요 기능 --- */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">JGuard가 함께 지켜드립니다</h2>
                    <p className="section-sub">진단부터 조회, 예방, 공유까지 — 전세 계약의 모든 단계를 돕는 기능</p>
                    <div className="features-grid">
                        {FEATURES.map((f) => (
                            <Link to={f.to} className="feature-card card card-hover" key={f.title}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                                <span className="feature-more">바로가기 <FaArrowRight /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 이용 방법 --- */}
            <section className="steps-section">
                <div className="container">
                    <h2 className="section-title">3분이면 충분합니다</h2>
                    <p className="section-sub">복잡한 서류 없이, 아는 정보만 입력해도 진단이 시작됩니다.</p>
                    <div className="steps-grid">
                        {STEPS.map((s) => (
                            <div className="step-card" key={s.no}>
                                <span className="step-no">{s.no}</span>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA 밴드 --- */}
            <section className="cta-band">
                <div className="cta-inner">
                    <h2>내 보증금, 지금 바로 점검해 보세요</h2>
                    <p>회원가입 없이도 AI 진단을 무료로 이용할 수 있습니다.</p>
                    <button className="btn btn-lg cta-btn" onClick={() => navigate('/risk_check')}>
                        <FaRobot /> AI 진단 시작하기
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
