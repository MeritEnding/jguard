import React, { useState, useEffect } from 'react';
import aiImage from './assets/search.png'; // 로컬 이미지를 import
import './JeonsePreventionGame.css';
import Header from './Header';

function JeonsePreventionGame() {
  const [gameState, setGameState] = useState('menu');
  const [caseFiles, setCaseFiles] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [investigationLog, setInvestigationLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/jeonse_case_files.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then(data => {
        setCaseFiles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("케이스 파일을 불러오는 데 실패했습니다:", error);
        setLoading(false);
      });
  }, []);

  const handleSelectCase = (caseData) => {
    setCurrentCase(caseData);
    setGameState('briefing');
    setInvestigationLog([]);
  };

  const handleInvestigationAction = (actionKey) => {
    const finding = currentCase.toolkit[actionKey].finding;
    if (!investigationLog.some(log => log.action === currentCase.toolkit[actionKey].label)) {
        setInvestigationLog(prev => [...prev, { action: currentCase.toolkit[actionKey].label, finding }]);
    }
  };

  const handleDecision = (decision) => {
    const allChecksDone = currentCase.correctChecks.every(key => 
        investigationLog.some(log => log.action === currentCase.toolkit[key].label)
    );

    if (currentCase.isFraudCase) {
      if (decision === 'no_contract' && allChecksDone) {
        setGameState('outcome_safe');
      } else {
        setGameState('outcome_unsafe');
      }
    } else {
      if (decision === 'contract' && allChecksDone) {
        setGameState('outcome_safe');
      } else {
        setGameState('outcome_unsafe');
      }
    }
  };

  const handleRestart = () => {
    setGameState('menu');
    setCurrentCase(null);
  };


  const renderMenu = () => (
    <div className="menu-screen">
      <div className="title-container">
        {/* --- ▼▼▼ 수정된 부분: import한 이미지를 사용 ▼▼▼ --- */}
        <img src={aiImage} alt="탐정 실루엣" className="detective-silhouette" />
        {/* --- ▲▲▲ 수정된 부분 끝 ▲▲▲ --- */}
        <h1 className="game-title">전세사기 예방: 사건 서류철</h1>
      </div>
      <p className="game-subtitle">실제 사기 사건을 바탕으로 한 추리 시뮬레이션입니다. <br/> 각 사건을 조사하여 현명한 탐정의 결정을 내리세요.</p>
      {loading ? (<p>사건 파일을 불러오는 중...</p>) : (
        <div className="case-selection">
          {caseFiles.map(c => (
            <div key={c.id} className="case-card" onClick={() => handleSelectCase(c)}>
              <h3>{c.title}</h3>
              <p>{c.briefing.substring(0, 50)}...</p>
              <div className="case-card-footer">사건 조사 시작</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBriefing = () => (
    <div className="briefing-screen">
      <h2 className="case-title-header">{currentCase.title}</h2>
      <p className="scenario">{currentCase.briefing}</p>
      <button onClick={() => setGameState('investigation')}>조사를 시작한다</button>
    </div>
  );

  const renderInvestigation = () => (
    <div className="investigation-screen">
      <h2 className="case-title-header">사건 조사</h2>
      <div className="investigation-layout">
        <div className="toolkit-panel">
          <h3>조사 도구</h3>
          {Object.entries(currentCase.toolkit).map(([key, value]) => {
            const isChecked = investigationLog.some(log => log.action === value.label);
            return (
              <button key={key} onClick={() => handleInvestigationAction(key)} disabled={isChecked} className="toolkit-btn">
                {value.label} {isChecked && <span className="checked-mark">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="log-panel">
          <h3>조사 기록</h3>
          {investigationLog.length === 0 ? (
            <p className="log-placeholder">아직 조사된 기록이 없습니다.<br/>조사 도구를 사용해 단서를 수집하세요.</p>
          ) : (
            <ul>
              {investigationLog.map((log, i) => (
                <li key={i}><strong>{log.action}:</strong> {log.finding}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="decision-panel">
        <h3>최종 결정</h3>
        <button className="safe-btn" onClick={() => handleDecision('no_contract')}>이 계약, 포기한다</button>
        <button className="danger-btn" onClick={() => handleDecision('contract')}>이 계약, 진행한다</button>
      </div>
    </div>
  );
  
  const renderOutcome = (isSafe) => (
    <div className="outcome-screen">
      <h2 className="case-title-header">사건 종결</h2>
      <div className={`result-box ${isSafe ? 'safe' : 'unsafe'}`}>
        <h3>{isSafe ? "사건 해결: 안전한 결정" : "사건 실패: 위험한 결정"}</h3>
        <p>{isSafe ? currentCase.outcome.safe : currentCase.outcome.unsafe}</p>
      </div>
      <div className="checklist-box">
        <h4><span className="icon">☞</span> 이 사건의 핵심 수사법</h4>
        <ul>
          {currentCase.outcome.checklist.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
      <button onClick={handleRestart}>다른 사건 파일 보기</button>
    </div>
  );

  const renderContent = () => {
    switch (gameState) {
      case 'briefing': return renderBriefing();
      case 'investigation': return renderInvestigation();
      case 'outcome_safe': return renderOutcome(true);
      case 'outcome_unsafe': return renderOutcome(false);
      case 'menu':
      default:
        return renderMenu();
    }
  };

 return (
    // React Fragment(<></>)를 사용하여 여러 컴포넌트를 감쌉니다.
    <>
      <Header />
      <div className="game-container-sherlock">
        {renderContent()}
      </div>
    </>
  );
}

export default JeonsePreventionGame;