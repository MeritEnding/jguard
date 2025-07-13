import React, { useState, useRef } from 'react';
import './Cb.css';
import Header from './Header';

function parseReportText(text) {
    try {
        const parsedData = {};

        // 섹션 분리 (## 또는 ###으로 시작하고 숫자. 으로 이어지는 제목 기준)
        const sections = text.split(/(?=(?:##|###)\s*\d\.\s*)/).filter(Boolean);

        if (sections.length === 0) {
            if (text.includes("오류 발생")) {
                throw new Error(text.replace(/###?\s*\d\.\s*오류 발생\n/, ""));
            }
            throw new Error("보고서 내용을 섹션으로 나눌 수 없습니다.");
        }

        sections.forEach(section => {
            const titleMatch = section.match(/(?:##|###)\s*\d\.\s*(.+)/);
            const title = titleMatch ? titleMatch[1].trim() : '알 수 없음';
            const content = section.replace(/(?:##|###)\s*\d\.\s*.+?\n/, '').trim();

            if (title.startsWith("위험 요약 대시보드")) {
                const items = content.split('-').map(s => s.trim()).filter(Boolean);
                parsedData.dashboard = items.map(item => {
                    const [key, value] = item.split(':');
                    return { key: key.trim().replace(/\*\*/g, ''), value: value ? value.trim().replace(/\[|\]/g, '') : '평가없음' };
                });
            } else if (title.startsWith("계약 핵심 정보")) {
                const parts = content.split(/-\s*\*\*지역 위험도 브리핑\*\*:/);
                const summaryContent = parts[0];
                const briefingContent = parts[1];

                parsedData.summary = {};
                const summaryItems = summaryContent.split('-').filter(item => item.includes(':'));
                summaryItems.forEach(item => {
                    const [key, ...valueParts] = item.split(':');
                    if (key.trim()) {
                        parsedData.summary[key.trim().replace(/\*\*/g, '')] = valueParts.join(':').trim().replace(/\*\*/g, '');
                    }
                });
                parsedData.briefing = briefingContent?.trim().replace(/\*\*/g, '') || "지역 위험도 정보가 없습니다.";

            } else if (title.startsWith("잠재적 위험 요소")) {
                parsedData.risks = content.split(/-\s*\*\*/).slice(1).map(item => {
                    const [category, ...descParts] = item.split('**');
                    return { category: category.trim(), description: descParts.join('').replace(":", "").trim() };
                });
            } else if (title.startsWith("공인중개사 신뢰도 검증")) {
                parsedData.realtorCheck = content.split(/-\s*\*\*/).slice(1).map(item => {
                    const [category, ...descParts] = item.split('**');
                    return { category: category.trim(), description: descParts.join('').replace(":", "").trim() };
                });
            } else if (title.startsWith("전반적인 위험 수준 최종 평가")) {
                const levelMatch = content.match(/-\s*\*\*최종 위험 수준\*\*:\s*(.+)/);
                const reasonMatch = content.match(/-\s*\*\*핵심 이유\*\*:\s*(.+)/);
                parsedData.assessment = {
                    level: levelMatch ? levelMatch[1].trim() : "알 수 없음",
                    description: reasonMatch ? reasonMatch[1].trim().replace(/\*\*/g, '') : "상세 설명이 없습니다."
                };
            } else if (title.startsWith("맞춤형 실행 체크리스트")) {
                const parsedChecklist = [];
                // ' - 카테고리:' 패턴으로 분리하고, 각 부분에서 카테고리와 할 일 목록 추출
                // 이전 LLM 출력 (이미지): " - 계약 체결 전: ... - 잔금 지급일: ..."
                const sections = content.split(/-\s*([^:]+):\s*/).filter(Boolean);

                for (let i = 0; i < sections.length; i += 2) {
                    const category = sections[i].trim(); // 예: "계약 체결 전"
                    const rawTasks = sections[i + 1] ? sections[i + 1].trim() : '';

                    // 할 일 목록을 쉼표(,)를 기준으로 분리, 불필요한 공백 제거
                    const tasks = rawTasks
                        .split(/,\s*|\.\s*|;\s*/) // 쉼표, 마침표, 세미콜론 뒤에 공백 포함하여 분리
                        .map(t => t.trim())
                        .filter(Boolean); // 빈 문자열 제거

                    if (category) {
                        parsedChecklist.push({ category, tasks });
                    }
                }
                parsedData.checklist = parsedChecklist;

            } else if (title.startsWith("발생 가능한 최악의 시나리오")) {
                const parsedScenarios = [];
                // 이미지 속 LLM 출력: '1. - 시나리오 1 [제목]: 피해 경로: ...'
                // 시나리오 번호 (1. )와 그 다음 내용 ( - 시나리오 1 [제목]: ...) 으로 분리
                const rawScenarioBlocks = content.split(/(\d+\.\s*-\s*시나리오\s*\d+\s*\[[^\]]+\]:\s*)/).filter(Boolean);

                for (let i = 0; i < rawScenarioBlocks.length; i += 2) {
                    const fullScenarioHeader = rawScenarioBlocks[i].trim(); // 예: "1. - 시나리오 1 [제목]:"
                    const fullDescription = rawScenarioBlocks[i + 1] ? rawScenarioBlocks[i + 1].trim() : ''; // "피해 경로: ... 사전 예방: ... 사후 대응: ..."

                    // 시나리오 제목 추출: "[제목]" 부분만
                    const titleMatch = fullScenarioHeader.match(/\[([^\]]+)\]/);
                    const scenarioTitle = titleMatch ? titleMatch[1].trim() : `시나리오 ${Math.floor(i / 2) + 1}`;

                    let path = "내용 없음";
                    let prevention = "내용 없음";
                    let response = "내용 없음";

                    // '피해 경로:', '사전 예방:', '사후 대응:' 키워드를 기준으로 내용 분리
                    const pathMatch = fullDescription.match(/피해 경로:\s*([\s\S]+?)(?:,\s*사전 예방:|,?\s*사후 대응:|$)/);
                    const preventionMatch = fullDescription.match(/사전 예방:\s*([\s\S]+?)(?:,\s*사후 대응:|$)/);
                    const responseMatch = fullDescription.match(/사후 대응:\s*([\s\S]+)/);


                    path = pathMatch ? pathMatch[1].trim() : "내용 없음";
                    prevention = preventionMatch ? preventionMatch[1].trim() : "내용 없음";
                    response = responseMatch ? responseMatch[1].trim() : "내용 없음";

                    // 만약 파싱된 내용이 너무 짧거나 누락되었다면, 전체 설명을 다시 재할당 (최후의 보루)
                    if (path === "내용 없음" && prevention === "내용 없음" && response === "내용 없음") {
                        path = fullDescription; // 모든 것을 피해 경로로 할당
                    }


                    parsedScenarios.push({
                        title: scenarioTitle,
                        path: path,
                        prevention: prevention,
                        response: response,
                    });
                }
                parsedData.scenarios = parsedScenarios;
            }
        });

        return parsedData;

    } catch (error) {
        console.error("보고서 텍스트 파싱 최종 실패:", error);
        return { error: { title: "보고서 분석 실패", description: error.message } };
    }
}

function AnalysisReport({ data, onReset }) {
    if (!data || data.error) {
        return (
            <div className="report-viewer-container error-view">
                <header className="report-header"><h1>분석 오류</h1></header>
                <main className="report-body"><p>{data?.error?.description || "알 수 없는 오류"}</p></main>
                <footer className="report-footer"><button onClick={onReset}>다시 분석하기</button></footer>
            </div>
        );
    }

    const getRiskLevelClass = (level = '') => {
        if (level.includes('고위험') || level.includes('위험') || level.includes('매우 높음')) return 'level-high';
        if (level.includes('주의') || level.includes('높음')) return 'level-medium';
        if (level.includes('보통')) return 'level-low';
        return 'level-safe';
    };

    return (
        <div className="report-viewer-container">
            <header className="report-header">
                <h1>AI 전세 계약 위험 종합 분석 보고서</h1>
                <p>본 보고서는 제공된 자료와 지역 데이터를 기반으로 한 AI의 심층 분석 결과입니다.</p>
            </header>
            <main className="report-body">
                {data.dashboard && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">📊</span>위험 요약 대시보드</h2></div>
                    <div className="dashboard-grid">
                        {data.dashboard.map(({ key, value }) => (
                            <div className="dashboard-item" key={key}>
                                <span className="key">{key}</span>
                                {/* 키와 값 사이에 공백 추가 */}
                                <span className={`value ${getRiskLevelClass(value)}`}>&nbsp;{value}</span>
                            </div>
                        ))}
                    </div>
                </section>}

                {data.summary && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">📋</span>계약 핵심 정보 및 지역 위험도 브리핑</h2></div>
                    <div className="summary-grid">
                        {Object.entries(data.summary).map(([key, value]) => (
                            <div className="summary-item" key={key}>
                                <span className="key">{key}</span>
                                <span className="value">{value}</span>
                            </div>
                        ))}
                    </div>
                    {data.briefing && <div className="briefing-box">
                        <strong>지역 위험도 브리핑:</strong> {data.briefing}
                    </div>}
                </section>}

                {data.risks && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">⚠️</span>잠재적 위험 요소 심층 분석</h2></div>
                    <ul className="risk-list">
                        {data.risks.map((risk, index) => (
                            <li className="risk-item" key={index}>
                                <div className="text">
                                    <span className="category">🔴 {risk.category}</span>
                                    <p className="description">{risk.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>}

                {data.realtorCheck && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">🧑‍💼</span>공인중개사 신뢰도 검증</h2></div>
                    <ul className="risk-list">
                        {data.realtorCheck.map((item, index) => (
                            <li className="risk-item" key={index}>
                                <div className="text">
                                    <span className="category">🔵 {item.category}</span>
                                    <p className="description">{item.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>}

                {data.assessment && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">⚖️</span>전반적인 위험 수준 최종 평가</h2></div>
                    <div className="risk-assessment">
                        <div className={`risk-level-display ${getRiskLevelClass(data.assessment.level)}`}>
                            {data.assessment.level}
                        </div>
                        <p><strong>핵심 근거:</strong> {data.assessment.description}</p>
                    </div>
                </section>}

                {data.checklist && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">✅</span>맞춤형 실행 체크리스트</h2></div>
                    <div className="checklist-container">
                        {data.checklist.map((list, index) => (
                            <div className="checklist-group" key={index}>
                                <h3>{list.category}</h3>
                                <ul>
                                    {list.tasks && list.tasks.length > 0 ? (
                                        list.tasks.map((task, i) => (
                                            <li key={i}>⬜️ {task}</li>
                                        ))
                                    ) : (
                                        <li>항목이 없습니다.</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>}

                {data.scenarios && <section className="report-section">
                    <div className="section-title"><h2><span className="icon">🚨</span>발생 가능한 최악의 시나리오 및 대응 전략</h2></div>
                    <div className="scenario-container">
                        {data.scenarios.map((scenario, index) => (
                            <div className="scenario-item" key={index}>
                                <h3>{index + 1}. {scenario.title}</h3>
                                {/* LLM이 피해경로/사전예방/사후대응 키워드를 줄바꿈 없이 출력한다고 가정 */}
                                {scenario.path && <p>{scenario.path}</p>}
                                {scenario.prevention && <p>{scenario.prevention}</p>}
                                {scenario.response && <p>{scenario.response}</p>}
                            </div>
                        ))}
                    </div>
                </section>}
            </main>
            <footer className="report-footer"><button onClick={onReset}>새로운 파일 분석하기</button></footer>
        </div>
    );
}

function Cb() {
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const wsRef = useRef(null);

    const BASE_URL = "https://9b97cfe7602c.ngrok-free.app";

    const handleFileAnalysis = async () => {
        if (!file) {
            setUploadMessage("📝 파일을 먼저 업로드해주세요.");
            return;
        }
        setIsAnalyzing(true);
        setReportData(null);
        setUploadMessage("AI 변호사가 문서를 정밀 분석 중입니다...");

        try {
            const initResponse = await fetch(`${BASE_URL}/initialize_session/`, { method: 'POST' });
            if (!initResponse.ok) throw new Error('세션 초기화 실패');
            const { session_id } = await initResponse.json();

            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${BASE_URL.split('//')[1]}/ws/${session_id}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = async () => {
                const formData = new FormData();
                formData.append('file', file);

                fetch(`${BASE_URL}/upload_and_analyze/?session_id=${session_id}`, {
                    method: 'POST',
                    body: formData,
                }).catch(err => {
                    console.error('Upload fetch failed:', err);
                    setReportData({ error: { title: "파일 업로드 실패", description: err.message } });
                    setIsAnalyzing(false);
                });
            };

            wsRef.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                if (messageData.type === 'analysis_report') {
                    setReportData(parseReportText(messageData.message));
                } else if (messageData.type === 'error') {
                    setReportData({ error: { title: "분석 서버 오류", description: messageData.message } });
                }
                setIsAnalyzing(false);
                wsRef.current?.close();
            };

            wsRef.current.onerror = (errorEvent) => {
                console.error('WebSocket 연결 오류 발생:', errorEvent);
                setReportData({ error: { title: "WebSocket 연결 오류", description: "서버 연결에 실패했습니다. 서버 상태를 확인하세요." } });
                setIsAnalyzing(false);
            };

        } catch (error) {
            console.error('분석 프로세스 실패:', error);
            setReportData({ error: { title: "클라이언트 오류", description: error.message } });
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setReportData(null);
        setUploadMessage('');
        setIsAnalyzing(false);
        wsRef.current?.close();
    };

    return (
        <>
            <Header/>
            <div className="chatbot-wrapper">
                {reportData ? (
                    <AnalysisReport data={reportData} onReset={handleReset} />
                ) : (
                    <div className="initial-view-container">
                        <h1>AI 전세사기<br />위험 분석</h1>
                        <p>계약서 등 관련 자료를 업로드하시면, AI가 자동으로 문서를 분석하여 개인 맞춤형 최종 보고서를 생성해 드립니다.</p>
                        <div className="file-upload-section">
                            <input
                                type="file"
                                id="fileUploadInput"
                                accept=".pdf,.docx"
                                onChange={(e) => {
                                    const selectedFile = e.target.files[0];
                                    setFile(selectedFile);
                                    setUploadMessage(selectedFile ? `선택된 파일: ${selectedFile.name}` : '');
                                }}
                                style={{ display: 'none' }}
                                disabled={isAnalyzing}
                            />
                            <label htmlFor="fileUploadInput" className="file-upload-label">
                                {file ? `✔️ ${file.name}` : "📁 분석할 파일 선택하기 (.pdf, .docx)"}
                            </label>
                            <button onClick={handleFileAnalysis} disabled={isAnalyzing || !file}>
                                {isAnalyzing ? "분석 중..." : "🚀 정밀 분석 시작하기"}
                            </button>
                            {uploadMessage && !isAnalyzing && <p className="upload-message">{uploadMessage}</p>}
                            {isAnalyzing && <p className="upload-message analyzing">{uploadMessage}</p>}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Cb;