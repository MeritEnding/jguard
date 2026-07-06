// src/components/Guide.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Guide.css';
import Header from './Header';
import axiosInstance from './api/axiosInstance';
import { FaAngleDown, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

// Chart.js 필수 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ✨ New: 트렌드 카드 내부에 들어갈 미니 그래프 (스파크라인)
const Sparkline = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.period),
        datasets: [{
            data: data.map(item => item.ratio),
            borderColor: data[data.length - 1].ratio >= data[data.length - 2]?.ratio ? '#00B894' : '#D63031',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0, // 점 숨기기
            fill: false
        }]
    };
    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
    };
    return <Line data={chartData} options={options} />;
};

// ✨ New: 키워드 트렌드를 보여주는 대시보드 카드
const TrendCard = ({ keyword, data }) => {
    if (data.length < 2) return null; // 데이터가 부족하면 렌더링하지 않음

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = latest.ratio - previous.ratio;

    const getTrend = () => {
        if (change > 1) return { icon: <FaArrowUp />, class: 'up', text: '상승' };
        if (change < -1) return { icon: <FaArrowDown />, class: 'down', text: '하락' };
        return { icon: <FaMinus />, class: 'stable', text: '유지' };
    };
    const trend = getTrend();

    return (
        <div className={`trend-card ${trend.class}`}>
            <div className="trend-card-header">
                <span className="trend-keyword">{keyword}</span>
                <span className={`trend-indicator ${trend.class}`}>
                    {trend.icon} {trend.text}
                </span>
            </div>
            <div className="trend-card-body">
                <div className="trend-ratio">
                    <span className="current-ratio">{latest.ratio.toFixed(1)}</span>
                    <span className="ratio-unit">%</span>
                </div>
                <div className="trend-sparkline">
                    <Sparkline data={data} />
                </div>
            </div>
            <div className="trend-card-footer">
                지난달 대비 {change.toFixed(1)}%p
            </div>
        </div>
    );
};

// ✨ New: 가이드 콘텐츠를 담을 아코디언 아이템
const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="accordion-title">{title}</span>
                <FaAngleDown className="accordion-icon" />
            </button>
            <div className="accordion-content">
                {children}
            </div>
        </div>
    );
};

const Guide = () => {
    const [trendData, setTrendData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null);

    // ... 기존 useEffect와 analyzeTrendData 함수는 동일하게 유지 ...
    useEffect(() => {
        const fetchAndAnalyze = async () => {
            setIsLoading(true); setError(null); setWarningMessage(null);
            try {
                const res = await axiosInstance.get("/api/trend");
                setTrendData(res.data);
                analyzeTrendData(res.data);
            } catch (err) {
                console.error("데이터 로드 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAndAnalyze();
    }, []);

    const analyzeTrendData = (data) => {
        if (!data || !data.results || data.results.length === 0) return;
        const keywordsToMonitor = ["깡통전세", "무자본 갭투자", "전세사기", "신축빌라 전세"];
        const warningThreshold = 60, recentMonths = 3;
        let warningText = [];

        data.results.forEach(group => {
            if (keywordsToMonitor.includes(group.title)) {
                const recentData = group.data.slice(-recentMonths);
                if (recentData.length === 0) return;
                const averageRecentRatio = recentData.map(d => d.ratio).reduce((a, b) => a + b, 0) / recentData.length;

                if (averageRecentRatio > warningThreshold) {
                    warningText.push(`'${group.title}' 검색량이 최근 ${recentMonths}개월 평균 ${averageRecentRatio.toFixed(1)}%로 높습니다.`);
                } else if (recentData.length >= 2 && recentData[recentData.length - 1].ratio > recentData[recentData.length - 2].ratio * 1.5) {
                    warningText.push(`'${group.title}' 검색량이 최근 급증했습니다.`);
                }
            }
        });

        if (warningText.length > 0) {
            setWarningMessage(warningText);
        } else {
            setWarningMessage(null); // 경고 없을 시 null로 설정
        }
    };


    return (
        <div className="guide-page-container">
            <Header />
            <main className="guide-main-content">
                <div className="guide-header">
                    <h1>전세 사기 예방 가이드</h1>
                    <p>데이터 트렌드와 단계별 체크리스트를 통해 소중한 보증금을 안전하게 지키세요.</p>
                </div>

                {/* --- 트렌드 대시보드 섹션 --- */}
                <section className="guide-section">
                    <h2>데이터로 보는 전세사기 위험 신호</h2>
                    {isLoading ? (
                        <div className="status-message">로딩 중...</div>
                    ) : error ? (
                        <div className="status-message error">{error}</div>
                    ) : (
                        <>
                            {warningMessage && (
                                <div className="trend-warning-message">
                                    <FaExclamationTriangle />
                                    <div className="warning-content">
                                        <strong>주의! 다음 키워드의 검색량이 급증했습니다.</strong>
                                        <ul>{warningMessage.map((text, i) => <li key={i}>{text}</li>)}</ul>
                                    </div>
                                </div>
                            )}
                            <div className="trend-grid">
                                {trendData?.results?.map(group => (
                                    <TrendCard key={group.title} keyword={group.title} data={group.data} />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* --- 예방 가이드 아코디언 섹션 --- */}
                <section className="guide-section">
                    <h2>단계별 예방 체크리스트</h2>
                    <div className="accordion-container">
                        <AccordionItem title="1. 계약 체결 전 유의사항">
                            <ul>
                                <li><strong>적정 시세 확인:</strong> 국토교통부 실거래가, 부동산테크, KB시세 등 복수 채널로 매매가와 전세가를 비교하고 전세가율이 너무 높은 매물은 피하세요.</li>
                                <li><strong>선순위 권리관계 확인:</strong> 등기부등본(등기소, 인터넷등기소)을 통해 근저당, 가압류 등 선순위 채권이 있는지 반드시 확인하세요.</li>
                                <li><strong>건축물대장 확인:</strong> 무허가·불법 건축물은 아닌지 건축물대장(세움터)을 통해 확인하세요. 위반 건축물은 대출 및 보증보험에 제약이 있을 수 있습니다.</li>
                                <li><strong>공인중개사 정보 확인:</strong> 국가공간정보포털에서 정상 영업 중인 중개사인지, 공제보험에 가입되어 있는지 확인하세요.</li>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="2. 계약 체결 시 유의사항">
                            <ul>
                                <li><strong>임대인 신분 확인:</strong> 계약 당사자가 등기부등본상 소유자와 일치하는지 신분증으로 확인하세요. 대리인과 계약 시 위임장, 인감증명서를 받고, 임대인과 직접 통화하여 위임 사실을 확인해야 합니다.</li>
                                <li><strong>임대인 세금 체납 여부 확인:</strong> 임대인 동의를 받아 미납 국세·지방세가 없는지 확인하세요. 체납 세금은 보증금보다 우선 변제될 수 있습니다.</li>
                                <li><strong>주택임대차표준계약서 사용:</strong> 보증금 보호에 유리한 특약(선순위 담보권 설정 금지 등)을 명시하고, 가급적 표준계약서를 사용하세요.</li>
                            </ul>
                        </AccordionItem>
                        <AccordionItem title="3. 계약 체결 후 및 잔금 지급 시">
                             <ul>
                                <li><strong>주택임대차 신고 및 확정일자 부여:</strong> 계약 후 30일 이내에 주민센터나 온라인으로 임대차 신고를 하세요. 확정일자가 자동으로 부여되어 보증금 우선변제권이 생깁니다.</li>
                                <li><strong>전입신고:</strong> 잔금 지급 및 이사 후 즉시 전입신고를 해야 다음 날부터 대항력이 발생합니다.</li>
                                <li><strong>전세보증금 반환보증 가입:</strong> HUG, HF, SGI 등 보증기관을 통해 보증보험에 가입하여 만일의 사태에 대비하세요.</li>
                                <li><strong>잔금 지급:</strong> 잔금은 반드시 등기부등본상 소유자 명의의 계좌로 이체해야 합니다.</li>
                            </ul>
                        </AccordionItem>
                         <AccordionItem title="4. 문제 발생 시 대응 방안">
                             <ul>
                                <li><strong>내용증명 발송:</strong> 계약 만기 전 임대인이 연락 두절되거나 보증금 반환이 어려울 것으로 예상되면, 즉시 계약 해지 및 보증금 반환을 요구하는 내용증명을 발송하세요.</li>
                                <li><strong>임차권 등기명령 신청:</strong> 계약 종료 후 보증금을 돌려받지 못한 상태에서 이사해야 할 경우, 법원에 임차권 등기명령을 신청하여 대항력과 우선변제권을 유지해야 합니다.</li>
                                <li><strong>전세피해 지원센터 상담:</strong> 전세사기 피해가 발생했다면 국토부 전세피해 지원센터(☎1533-8119)나 각 지자체 상담센터에 연락하여 법률 및 금융 지원 상담을 받으세요.</li>
                            </ul>
                        </AccordionItem>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Guide;