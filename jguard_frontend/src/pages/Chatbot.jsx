import React, { useState, useRef } from 'react';
import './Chatbot.css'; // 모든 스타일이 포함된 CSS 파일을 임포트합니다.

// [헬퍼 함수] 보고서 텍스트를 파싱하여 구조화된 객체로 변환합니다. (수정된 버전)
function parseReportText(text) {
    try {
        // "### \d. " 패턴으로 섹션을 나눕니다. 맨 앞은 빈 문자열이므로 제거합니다.
        const sections = text.split(/###\s*\d\.\s*/).slice(1);

        if (sections.length < 4) {
            throw new Error("보고서의 모든 섹션을 찾을 수 없습니다.");
        }

        // --- 1. 자료 요약 및 핵심 정보 파싱 ---
        const summaryContent = sections[0].replace(/^자료 요약 및 핵심 정보\s*-\s*/, '');
        const summaryItems = summaryContent.split(/\s*-\s*/).filter(item => item.includes(':'));
        const summary = summaryItems.reduce((obj, item) => {
            const [key, ...valueParts] = item.split(':');
            const value = valueParts.join(':').trim();
            if (key && value) {
                obj[key.replace(/\*\*/g, '').trim()] = value;
            }
            return obj;
        }, {});

        // --- 2. 잠재적 위험 요소 분석 파싱 ---
        const riskContent = sections[1].replace(/^잠재적 위험 요소 분석\s*-\s*/, '');
        const riskItems = riskContent.split(/\s*-\s*/).filter(item => item.includes(':'));
        const risks = riskItems.map(item => {
            const [category, ...descriptionParts] = item.split(':');
            const description = descriptionParts.join(':').trim();
            return {
                category: category.replace(/\*\*/g, '').trim(),
                description: description
            };
        });

        // --- 3. 전반적인 위험 수준 평가 파싱 ---
        const assessmentContent = sections[2].replace(/^전반적인 위험 수준 평가\s*/, '');
        const levelMatch = assessmentContent.match(/위험 수준:\s*\*\*([가-힣]+)\*\*/);
        const descriptionParts = assessmentContent.split(/\s*-\s*/);
        const assessment = {
            level: levelMatch ? levelMatch[1] : "알 수 없음",
            description: descriptionParts.length > 1 ? descriptionParts.slice(1).join(' ').trim() : "상세 설명이 없습니다."
        };

        // --- 4. 핵심 예방 조치 및 권고 사항 파싱 ---
        const recommendationContent = sections[3].replace(/^핵심 예방 조치 및 권고 사항\s*-\s*/, '');
        const recommendationItems = recommendationContent.split(/\s*-\s*/).filter(item => item.includes(':'));
        const recommendations = recommendationItems.map(item => {
            const [category, ...descriptionParts] = item.split(':');
            const description = descriptionParts.join(':').trim();
            return {
                category: category.replace(/\*\*/g, '').trim(),
                description: description
            };
        });

        return { summary, risks, assessment, recommendations };

    } catch (error) {
        console.error("Failed to parse report text:", error);
        return { 
            summary: { "오류": "보고서 내용을 분석하는 데 실패했습니다." }, 
            risks: [], 
            assessment: { level: "오류", description: "보고서 형식이 올바르지 않아 내용을 표시할 수 없습니다." }, 
            recommendations: [] 
        };
    }
}


// [내부 컴포넌트] 최종 분석 보고서를 표시하는 컴포넌트입니다.
function AnalysisReport({ data, onReset }) {
    if (!data) return null;

    return (
        <div className="report-viewer-container">
            <header className="report-header">
                <h1>AI 전세 계약 위험 분석 보고서</h1>
            </header>
            <main className="report-body">
                {/* 1. 자료 요약 */}
                <section className="report-section">
                    <div className="section-title">
                        <span className="icon">📋</span>
                        <h2>자료 요약 및 핵심 정보</h2>
                    </div>
                    <div className="summary-grid">
                        {Object.entries(data.summary).map(([key, value]) => (
                            <div className="summary-item" key={key}>
                                <span className="key">{key}</span>
                                <span className={`value ${value.includes('억') || value.includes('높음') ? 'important' : ''}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </section>
                {/* 2. 잠재적 위험 요소 */}
                <section className="report-section">
                    <div className="section-title">
                        <span className="icon">⚠️</span>
                        <h2>잠재적 위험 요소 분석</h2>
                    </div>
                    <ul className="risk-list">
                        {data.risks.map((risk, index) => (
                            <li className="risk-item" key={index}>
                                <span className="icon">🔴</span>
                                <div className="text">
                                    <span className="category">{risk.category}</span>
                                    <p className="description">{risk.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
                 {/* 3. 위험 수준 평가 */}
                 <section className="report-section">
                    <div className="section-title">
                        <span className="icon">📊</span>
                        <h2>전반적인 위험 수준 평가</h2>
                    </div>
                    <div className="risk-assessment">
                        <div className="risk-level-display">위험 수준: {data.assessment.level}</div>
                        <p>{data.assessment.description}</p>
                    </div>
                </section>
                {/* 4. 권고 사항 */}
                <section className="report-section">
                    <div className="section-title">
                        <span className="icon">🛡️</span>
                        <h2>핵심 예방 조치 및 권고 사항</h2>
                    </div>
                    <ul className="recommendation-list">
                       {data.recommendations.map((rec, index) => (
                           <li className="recommendation-item" key={index}>
                               <span className="icon">✔️</span>
                               <div className="text">
                                   <span className="category">{rec.category}</span>
                                   <p className="description">{rec.description}</p>
                               </div>
                           </li>
                       ))}
                    </ul>
                </section>
            </main>
            <footer className="report-footer">
                <button onClick={onReset}>새로운 파일 분석하기</button>
            </footer>
        </div>
    );
}

// [메인 컴포넌트]
function Chatbot() {
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const wsRef = useRef(null);

    const BASE_URL = "https://e4e4-34-45-25-177.ngrok-free.app";

    const handleFileAnalysis = async () => {
        if (!file) {
            setUploadMessage("📝 파일을 먼저 업로드해주세요.");
            return;
        }

        setIsAnalyzing(true);
        setUploadMessage("AI가 문서를 분석 중입니다... 잠시만 기다려주세요.");

        try {
            const initResponse = await fetch(`${BASE_URL}/initialize_session/`, { method: 'POST' });
            if (!initResponse.ok) throw new Error('세션 초기화 실패');
            const { session_id } = await initResponse.json();

            const wsProtocol = BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
            const wsHost = BASE_URL.split('//')[1];
            const wsUrl = `${wsProtocol}//${wsHost}/ws/${session_id}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = async () => {
                console.log('WebSocket connected for analysis.');
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch(`${BASE_URL}/upload_and_analyze/?session_id=${session_id}`, {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadResponse.ok) throw new Error('파일 업로드 및 분석 요청 실패');
            };

            wsRef.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                if (messageData.type === 'analysis_report') {
                    const parsedData = parseReportText(messageData.message);
                    setReportData(parsedData);
                    setIsAnalyzing(false);
                    if(wsRef.current) wsRef.current.close();
                } else if (messageData.type === 'error') {
                    throw new Error(`분석 오류: ${messageData.message}`);
                }
            };

            wsRef.current.onerror = (err) => {
                console.error('WebSocket Error:', err);
                throw new Error('WebSocket 연결 오류가 발생했습니다.');
            };

        } catch (error) {
            console.error('Analysis process failed:', error);
            setUploadMessage(`오류가 발생했습니다: ${error.message}`);
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setReportData(null);
        setUploadMessage('');
        setIsAnalyzing(false);
    };

    // reportData가 있으면 보고서 컴포넌트를, 없으면 파일 업로드 UI를 렌더링합니다.
    if (reportData) {
        return <AnalysisReport data={reportData} onReset={handleReset} />;
    }

    return (
        <div className="initial-view-container">
            <h1>AI 전세사기<br />위험 분석</h1>
            <p>계약서 등 관련 자료를 업로드하시면, AI가 자동으로 문서를 분석하여 최종 위험 보고서를 생성해 드립니다.</p>
            <div className="file-upload-section">
                <input 
                    type="file" 
                    id="fileUploadInput" 
                    accept=".pdf,.docx" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    disabled={isAnalyzing}
                />
                <label htmlFor="fileUploadInput">
                    {file ? `✔️ ${file.name}` : "📁 분석할 파일 선택하기"}
                </label>
                <button onClick={handleFileAnalysis} disabled={isAnalyzing || !file}>
                    {isAnalyzing ? "분석 중..." : "🚀 분석 시작하기"}
                </button>
                {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
            </div>
        </div>
    );
}

export default Chatbot;