import React, { useState, useEffect, useMemo } from 'react';
import './Acident_check.css'; // 동일한 경로에 CSS 파일이 있어야 합니다.
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const yearly_incidents_data = [
  { region_sub: "청주", incidents_23: 121, incidents_24: 236, incidents_25: 49 },
  { region_sub: "충주", incidents_23: 7, incidents_24: 15, incidents_25: 1 },
  { region_sub: "제천", incidents_23: 3, incidents_24: 2, incidents_25: 0 },
  { region_sub: "보은", incidents_23: 32, incidents_24: 16, incidents_25: 2 },
  { region_sub: "옥천", incidents_23: 0, incidents_24: 1, incidents_25: 0 },
  { region_sub: "영동", incidents_23: 2, incidents_24: 5, incidents_25: 1 },
  { region_sub: "증평", incidents_23: 18, incidents_24: 5, incidents_25: 0 },
  { region_sub: "진천", incidents_23: 1, incidents_24: 2, incidents_25: 1 },
  { region_sub: "괴산", incidents_23: 1, incidents_24: 1, incidents_25: 0 },
  { region_sub: "음성", incidents_23: 2, incidents_24: 20, incidents_25: 5 },
];

const chungbuk_accident_stats = [
    { region_sub: "청주 상당구", accidents: 8, amount_krw: 1550000000, rate_percent: 4.3 },
    { region_sub: "청주 서원구", accidents: 7, amount_krw: 1910000000, rate_percent: 3.3 },
    { region_sub: "청주 흥덕구", accidents: 9, amount_krw: 1569000000, rate_percent: 2.2 },
    { region_sub: "청주 청원구", accidents: 4, amount_krw: 976500000, rate_percent: 2.9 },
    { region_sub: "충주시", accidents: 11, amount_krw: 1966000000, rate_percent: 8.8 },
    { region_sub: "제천시", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "보은군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "옥천군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "영동군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "증평군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "진천군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "괴산군", accidents: 0, amount_krw: 0, rate_percent: 0.0 },
    { region_sub: "음성군", accidents: 7, amount_krw: 705000000, rate_percent: 30.1 },
    { region_sub: "단양군", accidents: 0, amount_krw: 0, rate_percent: 0.0 }
];

const chungbuk_jeonse_rates = [
    { region_sub: "청주 상당구", apt_1yr: 81.8, apt_3m: 82.2, multi_1yr: 70.7, multi_3m: null },
    { region_sub: "청주 서원구", apt_1yr: 83.5, apt_3m: 87.2, multi_1yr: 80.3, multi_3m: null },
    { region_sub: "청주 흥덕구", apt_1yr: 79.5, apt_3m: 79.1, multi_1yr: 67.5, multi_3m: null },
    { region_sub: "청주 청원구", apt_1yr: 82.2, apt_3m: 94.6, multi_1yr: 69.7, multi_3m: null },
    { region_sub: "충주시", apt_1yr: 78.7, apt_3m: 75.6, multi_1yr: 82.5, multi_3m: null },
    { region_sub: "제천시", apt_1yr: 80.6, apt_3m: 81.1, multi_1yr: 98.1, multi_3m: null },
    { region_sub: "보은군", apt_1yr: 54.9, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "옥천군", apt_1yr: 69.9, apt_3m: 70.1, multi_1yr: 59.6, multi_3m: null },
    { region_sub: "영동군", apt_1yr: 57.5, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "증평군", apt_1yr: 80.5, apt_3m: 79.9, multi_1yr: null, multi_3m: null },
    { region_sub: "진천군", apt_1yr: 77.8, apt_3m: 74.8, multi_1yr: 74.8, multi_3m: null },
    { region_sub: "괴산군", apt_1yr: null, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "음성군", apt_1yr: 73.4, apt_3m: 74.5, multi_1yr: 73.1, multi_3m: null },
    { region_sub: "단양군", apt_1yr: 81.2, apt_3m: null, multi_1yr: null, multi_3m: null }
];

const chungbuk_regions = [
  "청주 상당구", "청주 서원구", "청주 청원구", "청주 흥덕구",
  "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"
].sort();

function Acident_check() {
  const [realtors, setRealtors] = useState([]);
  const [police, setPolice] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // 실제 환경에서는 public 폴더 등에 json 파일들이 있어야 합니다.
    const realtorPromise = fetch('/chungbuk_realtors.json').then(res => res.json());
    const policePromise = fetch('/chungbuk_police_stations.json').then(res => res.json());
    const contactPromise = fetch('/chungbuk_contacts.json').then(res => res.json());

    Promise.all([realtorPromise, policePromise, contactPromise])
      .then(([realtorData, policeData, contactData]) => {
        setRealtors(realtorData);
        setPolice(policeData);
        setContacts(contactData);
      })
      .catch(error => {
        console.error("데이터를 불러오는 데 실패했습니다:", error);
        setRealtors([]);
        setPolice([]);
        setContacts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const reportData = useMemo(() => {
    if (!selectedRegion) return null;

    const accidentStat = chungbuk_accident_stats.find(a => a.region_sub === selectedRegion);
    const regionForYearlyData = selectedRegion.startsWith('청주') ? '청주' : selectedRegion.slice(0, -1);
    const yearlyIncidentData = yearly_incidents_data.find(i => i.region_sub === regionForYearlyData);
    const jeonseRateData = chungbuk_jeonse_rates.find(d => d.region_sub === selectedRegion);

    const regionParts = selectedRegion.split(' ');
    const realtorCount = realtors.filter(r => regionParts.every(part => (r['도로명주소(지번)'] || '').includes(part))).length;
    const policeCount = police.filter(p => regionParts.every(part => (p.address || '').includes(part))).length;
    const contactInfo = contacts.find(c => c.region === selectedRegion);

    return { realtorCount, accidentStat, policeCount, yearlyIncidentData, contactInfo, jeonseRateData };
  }, [selectedRegion, realtors, police, contacts]);
  
  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    const 억 = Math.floor(amount / 100000000);
    const 만 = Math.floor((amount % 100000000) / 10000);
    if (억 > 0) return `${억.toLocaleString()}억 ${만 > 0 ? ` ${만.toLocaleString()}만원` : ''}`;
    return `${만.toLocaleString()}만원`;
  };

  const handleRealtorClick = () => { if(selectedRegion) navigate(`/property_check`); };
  const handleRealtorClick1 = () => { if(selectedRegion) navigate('/police_check'); };

  return (
    <div className="report-pro-container">
      <Header />
      <header className="app-header">
        <h1>우리 동네 안심 리포트</h1>
        <br></br>
      </header>
      {loading ? ( <p>데이터 로딩 중...</p> ) : (
        <div className="report-generator">
          <p>궁금한 지역을 선택하고 안전도를 확인해보세요.</p>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="region-select">
            <option value="">-- 지역을 선택하세요 --</option>
            {chungbuk_regions.map(region => (<option key={region} value={region}>{region}</option>))}
          </select>
          {reportData && (
            <div className="report-card">
              <h2>{selectedRegion} 종합 리포트</h2>
              <div className="report-grid">
                
                <div className="report-item clickable" onClick={handleRealtorClick}>
                  <div className="item-icon">🏠</div>
                  <div className="item-label">등록 중개업소</div>
                  <div className="item-value">{reportData.realtorCount}<span> 개소</span></div>
                  <button className="item-action">클릭해서 목록 보기</button>
                </div>

                <div className="report-item">
                  <div className="item-icon">📈</div>
                  <div className="item-label">최근 사고 금액</div>
                  <div className="item-value amount">{formatCurrency(reportData.accidentStat?.amount_krw)}</div>
                </div>
                
                <div className="report-item">
                    <div className="item-icon">⚠️</div>
                    <div className="item-label">보증 사고율</div>
                    <div className="item-value">{reportData.accidentStat?.rate_percent}<span> %</span></div>
                </div>
                
                {reportData.jeonseRateData && (
                    <div className="report-item jeonse-rate-card">
                        <div className="item-icon">🏘️</div>
                        <div className="item-label">주택 유형별 전세가율 (%)</div>
                        <div className="rate-breakdown">
                            <div className="rate-column">
                                <h4>아파트</h4>
                                <p><span className="rate-label">최근 1년:</span> {reportData.jeonseRateData.apt_1yr || 'N/A'}</p>
                                <p><span className="rate-label">최근 3개월:</span> {reportData.jeonseRateData.apt_3m || 'N/A'}</p>
                            </div>
                            <div className="rate-column">
                                <h4>연립/다세대</h4>
                                <p><span className="rate-label">최근 1년:</span> {reportData.jeonseRateData.multi_1yr || 'N/A'}</p>
                                <p><span className="rate-label">최근 3개월:</span> {reportData.jeonseRateData.multi_3m || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {reportData.yearlyIncidentData && (
                  <div className="report-item">
                    <div className="item-icon">🗓️</div>
                    <div className="item-label">연도별 사고 건수 (청주시 전체)</div>
                    <div className="item-value-small">
                      <p><span className="year-label">23년</span><span className="count-value">{reportData.yearlyIncidentData.incidents_23}건</span></p>
                      <p><span className="year-label">24년</span><span className="count-value">{reportData.yearlyIncidentData.incidents_24}건</span></p>
                      <p><span className="year-label">25년</span><span className="count-value">{reportData.yearlyIncidentData.incidents_25}건</span></p>
                    </div>
                  </div>
                )}

                <div className="report-item clickable" onClick={handleRealtorClick1}>
                  <div className="item-icon">👮</div>
                  <div className="item-label">지역 경찰서</div>
                  <div className="item-value">{reportData.policeCount}<span> 개소</span></div>
                  <button className="item-action">클릭해서 목록 보기</button>
                </div>

                {/* --- ▼▼▼ 누락되었던 연락처 카드 다시 추가 ▼▼▼ --- */}
                {reportData.contactInfo && (
                  <div className="report-item contact-item">
                    <div className="item-icon">📞</div>
                    <div className="item-label">관련 기관 연락처</div>
                    <div className="contact-info">
                        <strong>{reportData.contactInfo.agency}</strong>
                        <span>{reportData.contactInfo.department}</span>
                        <a href={`tel:${reportData.contactInfo.phone}`}>{reportData.contactInfo.phone}</a>
                    </div>
                  </div>
                )}
                {/* --- ▲▲▲ 연락처 카드 추가 끝 ▲▲▲ --- */}
                
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Acident_check;