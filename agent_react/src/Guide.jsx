import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Guide.css';
import Header from './Header';
import axiosInstance from './api/axiosInstance';

// Chart.js 필수 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Guide = () => {
    const [trendData, setTrendData] = useState(null);
    const [isLoadingTrend, setIsLoadingTrend] = useState(true);
    const [errorTrend, setErrorTrend] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null); // 🟢 경고 메시지 상태 추가

    useEffect(() => {
        // 검색어 트렌드 데이터 불러오기
        const fetchTrendData = async () => {
            setIsLoadingTrend(true);
            setErrorTrend(null);
            setWarningMessage(null); // 🟢 새로운 데이터 로드 전에 경고 메시지 초기화
            try {
                const res = await axiosInstance.get("http://localhost:8080/api/trend");
                const data = res.data;

                console.log("받은 트렌드 데이터 (월별):", data);
                setTrendData(data);

                // 🟢 데이터 로드 성공 후 트렌드 분석 및 경고 메시지 설정
                analyzeTrendData(data);

            } catch (err) {
                console.error("검색어 트렌드 로드 실패:", err);
                if (err.response) {
                    const errorMessage = err.response.data.message || err.response.data || "트렌드 데이터를 불러오지 못했습니다.";
                    setErrorTrend(`오류: ${errorMessage}`);
                } else if (err.request) {
                    setErrorTrend("네트워크 오류: 트렌드 데이터를 불러올 수 없습니다. 서버에 연결할 수 없습니다.");
                } else {
                    setErrorTrend(`오류: ${err.message}`);
                }
                setTrendData(null);
            } finally {
                setIsLoadingTrend(false);
            }
        };

        fetchTrendData();
    }, []);

    // 🟢 트렌드 데이터를 분석하여 경고 메시지를 생성하는 함수
    const analyzeTrendData = (data) => {
        if (!data || !data.results || data.results.length === 0) {
            return;
        }

        const keywordsToMonitor = [
            "깡통전세",
            "무자본 갭투자",
            "전세사기",
            "신축빌라 전세" // 예시 키워드, 백엔드에서 제공하는 키워드와 일치해야 합니다.
        ];
        const warningThreshold = 60; // 검색량 비율 임계값 (예시: 60% 이상이면 경고)
        const recentMonths = 3; // 최근 몇 개월 데이터를 볼 것인지 (예시: 3개월)

        let foundWarning = false;
        let warningText = [];

        data.results.forEach(group => {
            const keyword = group.title;
            if (keywordsToMonitor.includes(keyword)) {
                // 최근 N개월 데이터만 필터링
                const recentData = group.data.slice(-recentMonths);
                const recentRatios = recentData.map(item => item.ratio);
                const averageRecentRatio = recentRatios.reduce((acc, val) => acc + val, 0) / recentRatios.length;

                // 단순 임계값 초과 체크 또는 급증 패턴 체크
                if (averageRecentRatio > warningThreshold) {
                    // 예시: 최근 3개월 평균 검색량 비율이 60% 이상일 경우 경고
                    warningText.push(`'${keyword}' 키워드의 최근 ${recentMonths}개월 평균 검색량이 ${averageRecentRatio.toFixed(1)}%로 높은 수준입니다. 관련 사기 유형에 주의하세요.`);
                    foundWarning = true;
                } else if (recentData.length >= 2 && recentData[recentData.length - 1].ratio > recentData[recentData.length - 2].ratio * 1.5) {
                    // 예시: 최근 검색량이 직전 달보다 1.5배 이상 급증한 경우
                    warningText.push(`'${keyword}' 키워드 검색량이 최근 급증했습니다. 주의 깊게 살펴보세요.`);
                    foundWarning = true;
                }
            }
        });

        if (foundWarning) {
            setWarningMessage(
                <>
                    <strong>⚠️ 전세사기 위험 경고!</strong><br/>
                    {warningText.map((text, index) => (
                        <span key={index}>{text}<br/></span>
                    ))}
                    <br/>계약 시 더욱 신중하게 접근하시고, 전문가와 상담을 권장합니다.
                </>
            );
        } else {
            setWarningMessage("현재 특이 검색 트렌드는 감지되지 않았습니다.");
        }
    };


    // 그래프 옵션 설정
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '주요 키워드 월별 검색 트렌드 변화',
                font: {
                    size: 20,
                    weight: 'bold',
                },
                padding: {
                    bottom: 20,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2) + ' (비율)';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: '날짜 (월)',
                    font: {
                        size: 14,
                    },
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                }
            },
            y: {
                title: {
                    display: true,
                    text: '검색량 비율',
                    font: {
                        size: 14,
                    },
                },
                min: 0,
                max: 100,
            },
        },
    };

    // 모든 키워드를 하나의 그래프에 그리기 위한 데이터 가공
    const combinedChartData = () => {
        if (!trendData || !trendData.results || trendData.results.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = trendData.results[0].data.map(item => item.period);

        const datasets = trendData.results.map((group, index) => {
            // 🟢 경고 키워드에 대한 색상 정의 (여기서는 예시로 고정 색상을 사용)
            const warningColors = {
                "깡통전세": { borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)' },
                "무자본 갭투자": { borderColor: 'orange', backgroundColor: 'rgba(255, 165, 0, 0.2)' },
                "전세사기": { borderColor: 'darkred', backgroundColor: 'rgba(139, 0, 0, 0.2)' },
                "신축빌라 전세": { borderColor: 'purple', backgroundColor: 'rgba(128, 0, 128, 0.2)' }
            };

            const defaultColors = [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(201, 203, 207, 1)'
            ];

            const chosenColor = warningColors[group.title] || {
                borderColor: defaultColors[index % defaultColors.length],
                backgroundColor: defaultColors[index % defaultColors.length].replace('1)', '0.2)')
            };

            return {
                label: group.title,
                data: group.data.map(item => item.ratio),
                borderColor: chosenColor.borderColor,
                backgroundColor: chosenColor.backgroundColor,
                fill: false,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: chosenColor.borderColor,
                pointBorderColor: 'white',
                pointHoverRadius: 7,
            };
        });

        return { labels, datasets };
    };

    const chartData = combinedChartData();

    return (
        <div className="guide-container">
            <Header />
            <h1 className="guide-title">전세 사기 예방 가이드</h1>
            <p className="guide-intro">
                전세 계약 시 발생할 수 있는 위험을 줄이고 안전하게 보증금을 지키기 위한 핵심 가이드입니다.
            </p>
            <hr /> {/* 구분선 추가 */}
            <section className="guide-section trend-section">
                <h2 style={{ fontSize: '1.8em', textAlign: 'center', color: '#2c3e50', marginBottom: '1.5em', fontWeight: 'bold' }}>
                    주요 전세 관련 키워드 검색 트렌드
                </h2>
                <p style={{ fontSize: '1.1em', textAlign: 'center', color: '#555', marginBottom: '2em' }}>
                    전세 시장의 흐름과 대중의 관심도를 월별 트렌드로 확인하여 계약 결정에 참고하세요.
                </p>

                {/* 🟢 경고 메시지 표시 영역 */}
                {warningMessage && (
                    <div className="trend-warning-message" style={{
                        backgroundColor: '#fff3cd', /* 연한 노란색 배경 */
                        border: '1px solid #ffeeba', /* 노란색 테두리 */
                        color: '#856404', /* 어두운 노란색 텍스트 */
                        padding: '15px 20px',
                        borderRadius: '8px',
                        marginBottom: '25px',
                        fontSize: '1.05em',
                        lineHeight: '1.5',
                        textAlign: 'center',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {warningMessage}
                    </div>
                )}

                <div className="chart-wrapper" style={{ width: '90%', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    {isLoadingTrend ? (
                        <p className="loading-message" style={{ textAlign: 'center', fontSize: '1.1em', color: '#888', padding: '50px' }}>
                            검색어 트렌드 데이터를 불러오는 중입니다...
                        </p>
                    ) : (
                        errorTrend ? (
                            <p className="error-message" style={{ textAlign: 'center', fontSize: '1.1em', color: 'red', padding: '50px' }}>
                                {errorTrend}<br/>
                                잠시 후 다시 시도해 주세요.
                            </p>
                        ) : (
                            trendData && trendData.results && trendData.results.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : (
                                <p className="no-data-message" style={{ textAlign: 'center', fontSize: '1.1em', color: '#888', padding: '50px' }}>
                                    현재 표시할 검색어 트렌드 데이터가 없습니다.<br/>
                                    데이터는 매월 1일에 업데이트되므로, 다음 업데이트를 기다려주세요.
                                </p>
                            )
                        )
                    )}
                </div>
            </section>
            <hr /> {/* 구분선 추가 */}
            <div className="guide-content-wrapper">
                <section className="guide-section">
                    <h2>계약 전 확인사항</h2>
                    <ul>
                        <li><strong>집주인 신원 확인:</strong> 등기부등본을 통해 실제 소유주와 계약자가 일치하는지 확인하세요.</li>
                        <li><strong>등기부등본 확인:</strong> 근저당권, 압류 등 선순위 채무가 없는지 확인하고, 있다면 보증금보다 적은지 확인하세요.</li>
                        <li><strong>건축물대장 확인:</strong> 불법 건축물 여부, 주거용 목적 여부 등을 확인하세요.</li>
                        <li><strong>전입세대 열람원 확인:</strong> 계약 당일 열람하여 다른 전입자가 없는지 확인하세요.</li>
                    </ul>
                </section>

                <section className="guide-section">
                    <h2>계약 시 유의사항</h2>
                    <ul>
                        <li><strong>확정일자 받기:</strong> 전입신고 후 반드시 동사무소에서 확정일자를 받아야 합니다.</li>
                        <li><strong>전세권 설정 등기:</strong> 대항력과 우선변제권을 확보하는 가장 강력한 방법입니다.</li>
                        <li><strong>특약 사항 명시:</strong> 전세 보증금 반환 조건, 수리 의무 등을 명확히 기재하세요.</li>
                        <li><strong>계약금과 잔금 지급:</strong> 집주인 계좌로 직접 송금하고 영수증을 받아두세요.</li>
                    </ul>
                </section>

                <section className="guide-section">
                    <h2>계약 후 대처방안</h2>
                    <ul>
                        <li><strong>보증보험 가입:</strong> 전세금 반환 보증보험에 가입하여 보증금을 보호하세요.</li>
                        <li><strong>주기적인 등기부등본 확인:</strong> 계약 후에도 혹시 모를 권리 변동을 확인하세요.</li>
                        <li><strong>문제가 발생하면 전문가와 상담:</strong> 법률 전문가의 도움을 받는 것이 중요합니다.</li>
                    </ul>
                </section>

                <section className="guide-section useful-links"> {/* useful-links 클래스 추가 */}
                    <h2>유용한 관련 링크</h2>
                    <ul>
                        <li><a href="https://www.hugg.or.kr/" target="_blank" rel="noopener noreferrer">주택도시보증공사 (HUG)</a></li>
                        <li><a href="https://www.law.go.kr/" target="_blank" rel="noopener noreferrer">법제처</a></li>
                        <li><a href="https://www.mois.go.kr/frt/a01/a0104/a010404/attFileDownload.do?attFileNo=FILE2024040900000000030" target="_blank" rel="noopener noreferrer">전세사기 예방 및 피해지원 안내서 (정부24)</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default Guide;