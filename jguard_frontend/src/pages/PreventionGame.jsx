import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFolderOpen, FaSearch, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './PreventionGame.css';
import mascotInspect from '../assets/mascot/inspect.png';
import mascotSafe from '../assets/mascot/safe.png';
import mascotDanger from '../assets/mascot/danger.png';

/** 실제 사기 수법 기반 추리 시뮬레이션 — 사건을 조사하고 계약 여부를 결정한다 */
function PreventionGame() {
    const [gameState, setGameState] = useState('menu');
    const [caseFiles, setCaseFiles] = useState([]);
    const [currentCase, setCurrentCase] = useState(null);
    const [investigationLog, setInvestigationLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/jeonse_case_files.json')
            .then((res) => {
                if (!res.ok) throw new Error('케이스 파일 로드 실패');
                return res.json();
            })
            .then((data) => setCaseFiles(data))
            .catch((err) => console.error('케이스 파일을 불러오는 데 실패했습니다:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleSelectCase = (caseData) => {
        setCurrentCase(caseData);
        setGameState('briefing');
        setInvestigationLog([]);
    };

    const handleInvestigationAction = (actionKey) => {
        const tool = currentCase.toolkit[actionKey];
        if (!investigationLog.some((log) => log.action === tool.label)) {
            setInvestigationLog((prev) => [...prev, { action: tool.label, finding: tool.finding }]);
        }
    };

    const handleDecision = (decision) => {
        const allChecksDone = currentCase.correctChecks.every((key) =>
            investigationLog.some((log) => log.action === currentCase.toolkit[key].label)
        );
        if (currentCase.isFraudCase) {
            setGameState(decision === 'no_contract' && allChecksDone ? 'outcome_safe' : 'outcome_unsafe');
        } else {
            setGameState(decision === 'contract' && allChecksDone ? 'outcome_safe' : 'outcome_unsafe');
        }
    };

    const handleRestart = () => {
        setGameState('menu');
        setCurrentCase(null);
    };

    const renderMenu = () => (
        <>
            <div className="page-head">
                <span className="page-eyebrow"><FaFolderOpen /> 추리 시뮬레이션</span>
                <h1>전세사기 예방: 사건 서류철</h1>
                <p>실제 사기 사건을 바탕으로 한 시뮬레이션입니다. 각 사건을 조사하고 현명한 결정을 내리세요.</p>
            </div>
            <div className="pg-menu-mascot">
                <img src={mascotInspect} alt="돋보기를 든 제이가드" />
            </div>
            {loading ? (
                <div className="status-message"><div className="spinner" /> 사건 파일을 불러오는 중...</div>
            ) : (
                <div className="pg-case-grid">
                    {caseFiles.map((c) => (
                        <button key={c.id} className="pg-case-card card card-hover" onClick={() => handleSelectCase(c)}>
                            <span className="pg-case-label">CASE FILE</span>
                            <h3>{c.title}</h3>
                            <p>{c.briefing.substring(0, 60)}...</p>
                            <span className="pg-case-open">사건 조사 시작 →</span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );

    const renderBriefing = () => (
        <div className="pg-panel card">
            <span className="badge badge-brand">사건 브리핑</span>
            <h2>{currentCase.title}</h2>
            <p className="pg-briefing">{currentCase.briefing}</p>
            <div className="pg-actions">
                <button className="btn btn-primary btn-lg" onClick={() => setGameState('investigation')}>
                    <FaSearch /> 조사를 시작한다
                </button>
            </div>
        </div>
    );

    const renderInvestigation = () => (
        <div className="pg-panel card">
            <span className="badge badge-brand">사건 조사</span>
            <h2>{currentCase.title}</h2>
            <div className="pg-invest-grid">
                <div className="pg-toolkit">
                    <h3>조사 도구</h3>
                    {Object.entries(currentCase.toolkit).map(([key, value]) => {
                        const isChecked = investigationLog.some((log) => log.action === value.label);
                        return (
                            <button
                                key={key}
                                onClick={() => handleInvestigationAction(key)}
                                disabled={isChecked}
                                className={`pg-tool-btn ${isChecked ? 'used' : ''}`}
                            >
                                {value.label} {isChecked && <FaCheck className="pg-check" />}
                            </button>
                        );
                    })}
                </div>
                <div className="pg-log">
                    <h3>조사 기록</h3>
                    {investigationLog.length === 0 ? (
                        <p className="pg-log-empty">아직 조사된 기록이 없습니다.<br />조사 도구를 사용해 단서를 수집하세요.</p>
                    ) : (
                        <ul>
                            {investigationLog.map((log, i) => (
                                <li key={i}><strong>{log.action}</strong><span>{log.finding}</span></li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="pg-decision">
                <h3>최종 결정</h3>
                <div className="pg-actions">
                    <button className="btn btn-outline btn-lg" onClick={() => handleDecision('no_contract')}>
                        이 계약, 포기한다
                    </button>
                    <button className="btn btn-danger btn-lg" onClick={() => handleDecision('contract')}>
                        이 계약, 진행한다
                    </button>
                </div>
            </div>
        </div>
    );

    const renderOutcome = (isSafe) => (
        <div className="pg-panel card">
            <div className={`pg-outcome ${isSafe ? 'safe' : 'unsafe'}`}>
                <img src={isSafe ? mascotSafe : mascotDanger} alt="" className="pg-outcome-mascot" />
                <h2>{isSafe ? '사건 해결: 안전한 결정' : '사건 실패: 위험한 결정'}</h2>
                <p>{isSafe ? currentCase.outcome.safe : currentCase.outcome.unsafe}</p>
            </div>
            <div className="pg-checklist">
                <h3>이 사건의 핵심 수사법</h3>
                <ul>
                    {currentCase.outcome.checklist.map((item, i) => <li key={i}><FaCheck /> {item}</li>)}
                </ul>
            </div>
            <div className="pg-actions">
                <button className="btn btn-primary btn-lg" onClick={handleRestart}>다른 사건 파일 보기</button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (gameState) {
            case 'briefing': return renderBriefing();
            case 'investigation': return renderInvestigation();
            case 'outcome_safe': return renderOutcome(true);
            case 'outcome_unsafe': return renderOutcome(false);
            default: return renderMenu();
        }
    };

    return (
        <div className="pg-page">
            <div className="pg-container">
                {gameState !== 'menu' && (
                    <button className="pg-back" onClick={handleRestart}><FaArrowLeft /> 사건 목록으로</button>
                )}
                {gameState === 'menu' && (
                    <Link to="/games" className="pg-back"><FaArrowLeft /> 게임 목록으로</Link>
                )}
                {renderContent()}
            </div>
        </div>
    );
}

export default PreventionGame;
