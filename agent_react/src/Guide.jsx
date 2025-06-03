// Guide.js 파일 예시 (가정)
import React from 'react';
import './Guide.css'; // Guide.css 임포트
import Header from './Header';
const Guide = () => {
  return (
    <div className="guide-container"> {/* 이 div는 이제 전체 화면을 차지 */}
      <Header></Header>
      <h1 className="guide-title">전세 사기 예방 가이드</h1>
      <p className="guide-intro">
        전세 계약 시 발생할 수 있는 위험을 줄이고 안전하게 보증금을 지키기 위한 핵심 가이드입니다.
      </p>

      {/* 이 div를 새로 추가하여 실제 콘텐츠의 최대 너비를 제한합니다 */}
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