import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStamp, FaArrowLeft, FaSearch } from 'react-icons/fa';
import './InspectorGame.css';
import mascotDocument from '../assets/mascot/document.png';
import mascotDone from '../assets/mascot/done.png';
import mascotSafe from '../assets/mascot/safe.png';
import mascotDanger from '../assets/mascot/danger.png';

const FIELD_LABELS = {
    name: '이름',
    address: '주소',
    ownerName: '소유자',
    liens: '권리관계 (대출 등)',
    landlordName: '임대인',
    deposit: '보증금',
    marketPrice: '시세',
};

const DOC_TITLES = { idCard: '신분증', register: '등기부등본', contract: '계약서 초안' };

/** 서류 대조 게임 — 신분증·등기부·계약서의 불일치를 찾아 사기 계약을 반려한다 */
function InspectorGame() {
    const [gameState, setGameState] = useState('menu');
    const [cases, setCases] = useState([]);
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [highlighted, setHighlighted] = useState({ field1: null, field2: null });
    const [mismatched, setMismatched] = useState(false);
    const [dailyReport, setDailyReport] = useState({ success: 0, fail: 0 });
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetch('/inspector_cases.json')
            .then((res) => res.json())
            .then((data) => setCases(data))
            .catch((err) => console.error('케이스 파일을 불러오는 데 실패했습니다:', err));
    }, []);

    const startGame = () => {
        setGameState('in_game');
        setCurrentCaseIndex(0);
        setDailyReport({ success: 0, fail: 0 });
        setFeedback(null);
        resetSelection();
    };

    const nextCase = () => {
        setFeedback(null);
        if (currentCaseIndex < cases.length - 1) {
            setCurrentCaseIndex((prev) => prev + 1);
            resetSelection();
        } else {
            setGameState('day_end');
        }
    };

    const resetSelection = () => {
        setHighlighted({ field1: null, field2: null });
        setMismatched(false);
    };

    const handleFieldClick = (document, field, value) => {
        if (feedback) return;
        const selection = { document, field, value };
        if (!highlighted.field1) {
            setHighlighted({ field1: selection, field2: null });
        } else if (highlighted.field1 !== selection) {
            setHighlighted({ field1: highlighted.field1, field2: selection });
            setMismatched(highlighted.field1.value !== selection.value);
        }
    };

    const handleStamp = (decision) => {
        const currentCase = cases[currentCaseIndex];
        const isCorrect = decision === 'approve'
            ? !currentCase.isFraud
            : currentCase.isFraud && mismatched;

        setDailyReport((prev) => ({
            success: prev.success + (isCorrect ? 1 : 0),
            fail: prev.fail + (isCorrect ? 0 : 1),
        }));
        setFeedback({
            correct: isCorrect,
            message: isCorrect
                ? '정확한 심사입니다!'
                : currentCase.isFraud
                    ? `잘못된 심사입니다! 사기 사유: ${currentCase.reason}`
                    : '잘못된 심사입니다! 이 계약은 안전했습니다.',
        });
    };

    const formatNumber = (value) => {
        const num = Number(value);
        return Number.isNaN(num) ? value : num.toLocaleString('ko-KR');
    };

    const currentCase = cases[currentCaseIndex];

    if (gameState === 'menu') {
        return (
            <div className="ig-page">
                <div className="ig-container">
                    <Link to="/games" className="ig-back"><FaArrowLeft /> 게임 목록으로</Link>
                    <div className="ig-menu card">
                        <img src={mascotDocument} alt="서류를 든 제이가드" className="ig-menu-mascot" />
                        <h1>안심부동산: 계약 심사관</h1>
                        <p>
                            당신은 시민의 보증금을 지키는 최후의 보루입니다.
                            <br />
                            서류를 클릭해 두 항목을 비교하고, 허점을 찾아 사기 계약을 막아내세요.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={startGame}>업무 시작</button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'day_end') {
        return (
            <div className="ig-page">
                <div className="ig-container">
                    <div className="ig-menu card">
                        <img src={mascotDone} alt="업무를 마친 제이가드" className="ig-menu-mascot" />
                        <h1>업무 종료</h1>
                        <div className="ig-report">
                            <div className="ig-report-item safe">
                                <strong>{dailyReport.success}</strong>
                                <span>정상 처리</span>
                            </div>
                            <div className="ig-report-item danger">
                                <strong>{dailyReport.fail}</strong>
                                <span>심사 오류</span>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={startGame}>새로운 하루 시작하기</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentCase) {
        return (
            <div className="ig-page">
                <div className="ig-container">
                    <div className="status-message"><div className="spinner" /> 케이스 로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="ig-page">
            <div className="ig-container">
                <div className="ig-desk-header">
                    <h2>계약 심사 <span className="ig-case-id">사건번호 {currentCase.caseId}</span></h2>
                    <div className={`ig-status ${mismatched ? 'found' : ''}`}>
                        <FaSearch /> {mismatched ? '단서 발견!' : '심사 대기 중...'}
                    </div>
                </div>

                <div className="ig-documents">
                    {Object.entries(currentCase.documents).map(([docKey, docValue]) => (
                        <div key={docKey} className="ig-document card">
                            <h3>{DOC_TITLES[docKey] || docKey}</h3>
                            <ul>
                                {Object.entries(docValue).map(([field, value]) => {
                                    const isSelected =
                                        highlighted.field1?.value === value || highlighted.field2?.value === value;
                                    return (
                                        <li
                                            key={field}
                                            onClick={() => handleFieldClick(docKey, field, value)}
                                            className={isSelected ? 'selected' : ''}
                                        >
                                            <span className="ig-field-label">{FIELD_LABELS[field] || field}</span>
                                            <span className="ig-field-value">{formatNumber(value)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {feedback ? (
                    <div className={`ig-feedback card ${feedback.correct ? 'safe' : 'danger'}`}>
                        <img src={feedback.correct ? mascotSafe : mascotDanger} alt="" />
                        <p>{feedback.message}</p>
                        <button className="btn btn-primary" onClick={nextCase}>
                            {currentCaseIndex < cases.length - 1 ? '다음 사건' : '실적 보고 보기'}
                        </button>
                    </div>
                ) : (
                    <div className="ig-stamps">
                        <button className="ig-stamp approve" onClick={() => handleStamp('approve')}>
                            <FaStamp /> 승인
                        </button>
                        <button className="ig-stamp reject" onClick={() => handleStamp('reject')} disabled={!mismatched}>
                            <FaStamp /> 반려
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InspectorGame;
