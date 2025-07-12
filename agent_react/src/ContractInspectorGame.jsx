import React, { useState, useEffect } from 'react';
import './ContractInspectorGame.css';
import Header from './Header';

// --- ▼▼▼ 추가된 부분 1: 영문 필드명을 한글 라벨로 변환하기 위한 객체 ▼▼▼ ---
const fieldLabels = {
  name: '이름',
  address: '주소',
  ownerName: '소유자',
  liens: '권리관계 (대출 등)',
  landlordName: '임대인',
  deposit: '보증금',
  marketPrice: '시세'
};
// --- ▲▲▲ 추가된 부분 끝 ▲▲▲ ---

function ContractInspectorGame() {
  const [gameState, setGameState] = useState('menu');
  const [cases, setCases] = useState([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [highlighted, setHighlighted] = useState({ field1: null, field2: null });
  const [mismatched, setMismatched] = useState(false);
  const [dailyReport, setDailyReport] = useState({ success: 0, fail: 0 });

  useEffect(() => {
    fetch('/inspector_cases.json')
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(error => console.error("케이스 파일을 불러오는 데 실패했습니다:", error));
  }, []);

  const startGame = () => {
    setGameState('in_game');
    setCurrentCaseIndex(0);
    setDailyReport({ success: 0, fail: 0 });
    resetSelection();
  };

  const nextCase = () => {
    if (currentCaseIndex < cases.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
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
    const selection = { document, field, value };
    if (!highlighted.field1) {
      setHighlighted({ field1: selection, field2: null });
    } else if (highlighted.field1 !== selection) {
      const field1 = highlighted.field1;
      const field2 = selection;
      setHighlighted({ field1, field2 });

      if (field1.value !== field2.value) {
        setMismatched(true);
      } else {
        setMismatched(false);
      }
    }
  };

  const handleStamp = (decision) => {
    const currentCase = cases[currentCaseIndex];
    let isCorrect = false;

    if (decision === 'approve') {
      if (!currentCase.isFraud) isCorrect = true;
    } else { // reject
      if (currentCase.isFraud && mismatched) isCorrect = true;
    }

    if (isCorrect) {
      setDailyReport(prev => ({ ...prev, success: prev.success + 1 }));
      alert("정확한 심사입니다!");
    } else {
      setDailyReport(prev => ({ ...prev, fail: prev.fail + 1 }));
      alert(`잘못된 심사입니다! ${currentCase.isFraud ? `사기 사유: ${currentCase.reason}` : '이 계약은 안전했습니다.'}`);
    }
    nextCase();
  };
  
  // --- ▼▼▼ 추가된 부분 2: 숫자 포맷팅 함수 ▼▼▼ ---
  const formatNumber = (value) => {
    // 숫자로 변환 가능한 값인지 확인 후 콤마를 추가합니다.
    const num = Number(value);
    if (!isNaN(num)) {
      return num.toLocaleString('ko-KR');
    }
    return value; // 숫자가 아니면 원래 값 반환
  };
  // --- ▲▲▲ 추가된 부분 끝 ▲▲▲ ---

  const currentCase = cases[currentCaseIndex];

  if (gameState === 'menu') {
    return (
      <div className="game-container-sherlock">
        <div className="menu-screen">
          <h1>안심부동산: 계약 심사관</h1>
          <p>당신은 시민의 보증금을 지키는 최후의 보루입니다.<br/>서류의 허점을 찾아내 사기 계약을 막아내세요.</p>
          <button onClick={startGame}>업무 시작</button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'day_end') {
    return (
        <div className="game-container-sherlock">
            <div className="day-end-screen">
                <h1>업무 종료</h1>
                <h2>오늘의 실적 보고</h2>
                <p><strong>정상 처리:</strong> {dailyReport.success}건</p>
                <p><strong>심사 오류:</strong> {dailyReport.fail}건</p>
                <button onClick={startGame}>새로운 하루 시작하기</button>
            </div>
        </div>
    )
  }

  if (!currentCase) {
    return <div className="game-container-sherlock"><p>케이스 로딩 중...</p></div>;
  }

  return (
    <>
    <Header />
        <div className="game-container-sherlock">
        <div className="desk-header">
            <h2>계약 심사 (사건번호: {currentCase.caseId})</h2>
            <div className="status-bar">
            <div className={`status-light ${mismatched ? 'active' : ''}`}></div>
            {mismatched ? "단서 발견!" : "심사 대기 중..."}
            </div>
        </div>
        <div className="desk-layout">
            <div className="document-container">
            {Object.entries(currentCase.documents).map(([docKey, docValue]) => (
                <div key={docKey} className="document">
                <h3>{docKey === 'idCard' ? '신분증' : docKey === 'register' ? '등기부등본' : '계약서 초안'}</h3>
                <ul>
                    {/* --- ▼▼▼ 수정된 부분 3: 한글 라벨과 숫자 포맷팅 적용 ▼▼▼ --- */}
                    {Object.entries(docValue).map(([field, value]) => (
                    <li key={field} onClick={() => handleFieldClick(docKey, field, value)} className={highlighted.field1?.value === value ? 'highlighted' : ''}>
                        <strong className="field-label">{fieldLabels[field] || field}:</strong> 
                        <span className="field-value">{formatNumber(value)}</span>
                    </li>
                    ))}
                    {/* --- ▲▲▲ 수정된 부분 끝 ▲▲▲ --- */}
                </ul>
                </div>
            ))}
            </div>
        </div>
        <div className="stamp-area">
            <button className="stamp approve" onClick={() => handleStamp('approve')}>승 인</button>
            <button className="stamp reject" onClick={() => handleStamp('reject')} disabled={!mismatched}>반 려</button>
            </div>
        </div>
    </>
  );
}

export default ContractInspectorGame;