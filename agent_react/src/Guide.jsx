import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Guide.css';
import Header from './Header';
import axiosInstance from './api/axiosInstance'; // 🟢 axiosInstance 임포트 추가

// Chart.js 필수 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Guide = () => {
    const [trendData, setTrendData] = useState(null);
    const [isLoadingTrend, setIsLoadingTrend] = useState(true); // 로딩 상태 추가
    const [errorTrend, setErrorTrend] = useState(null); // 🟢 에러 상태 추가

    useEffect(() => {
        // 검색어 트렌드 데이터 불러오기
        const fetchTrendData = async () => {
            setIsLoadingTrend(true); // 로딩 시작
            setErrorTrend(null); // 이전 에러 초기화
            try {
                // 🟢 fetch 대신 axiosInstance.get() 사용
                const res = await axiosInstance.get("http://localhost:8080/api/trend");
                const data = res.data; // axios는 응답 데이터를 res.data로 제공

                console.log("받은 트렌드 데이터 (월별):", data);
                setTrendData(data);
            } catch (err) {
                console.error("검색어 트렌드 로드 실패:", err);
                // 🟢 axios 에러 처리 방식에 맞게 수정
                if (err.response) {
                    // 서버 응답 에러 (예: 403 Forbidden, 500 Internal Server Error)
                    const errorMessage = err.response.data.message || err.response.data || "트렌드 데이터를 불러오지 못했습니다.";
                    setErrorTrend(`오류: ${errorMessage}`);
                } else if (err.request) {
                    // 네트워크 에러 (요청은 보냈으나 응답을 받지 못함)
                    setErrorTrend("네트워크 오류: 트렌드 데이터를 불러올 수 없습니다. 서버에 연결할 수 없습니다.");
                } else {
                    // 기타 에러
                    setErrorTrend(`오류: ${err.message}`);
                }
                setTrendData(null);
            } finally {
                setIsLoadingTrend(false); // 데이터 로드 완료 (성공/실패 무관)
            }
        };

        fetchTrendData();
    }, []); // 의존성 배열 비워둠 (컴포넌트 마운트 시 한 번만 실행)

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
            // 일관된 색상 부여를 위해 랜덤 대신 고정 색상 또는 색상 팔레트를 사용할 수 있습니다.
            // 여기서는 예시로 랜덤 색상을 유지합니다.
            const color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
            const backgroundColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`;

            return {
                label: group.title,
                data: group.data.map(item => item.ratio),
                borderColor: color,
                backgroundColor: backgroundColor,
                fill: false,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: color,
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
            ---
            <section className="guide-section trend-section">
                <h2 style={{ fontSize: '1.8em', textAlign: 'center', color: '#2c3e50', marginBottom: '1.5em', fontWeight: 'bold' }}>
                    주요 전세 관련 키워드 검색 트렌드
                </h2>
                <p style={{ fontSize: '1.1em', textAlign: 'center', color: '#555', marginBottom: '2em' }}>
                    전세 시장의 흐름과 대중의 관심도를 월별 트렌드로 확인하여 계약 결정에 참고하세요.
                </p>
                <div className="chart-wrapper" style={{ width: '90%', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    {isLoadingTrend ? ( // 로딩 중일 때 메시지
                        <p className="loading-message" style={{ textAlign: 'center', fontSize: '1.1em', color: '#888', padding: '50px' }}>
                            검색어 트렌드 데이터를 불러오는 중입니다...
                        </p>
                    ) : (
                        errorTrend ? ( // 에러 발생 시 메시지
                            <p className="error-message" style={{ textAlign: 'center', fontSize: '1.1em', color: 'red', padding: '50px' }}>
                                {errorTrend}<br/>
                                잠시 후 다시 시도해 주세요.
                            </p>
                        ) : (
                            trendData && trendData.results && trendData.results.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : ( // 데이터가 없을 때 메시지
                                <p className="no-data-message" style={{ textAlign: 'center', fontSize: '1.1em', color: '#888', padding: '50px' }}>
                                    현재 표시할 검색어 트렌드 데이터가 없습니다.<br/>
                                    데이터는 매월 1일에 업데이트되므로, 다음 업데이트를 기다려주세요.
                                </p>
                            )
                        )
                    )}
                </div>
            </section>
            ---
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

                <section className="guide-section">
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