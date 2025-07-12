import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function PoliceCheck() {
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // URL에서 'region' 값을 가져와 초기 검색어로 설정
  const [searchTerm, setSearchTerm] = useState(searchParams.get('region') || '');

  useEffect(() => {
    fetch('/chungbuk_police_stations.json')
      .then(response => response.json())
      .then(data => {
        setPolice(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("데이터를 불러오는 데 실패했습니다:", error);
        setLoading(false);
      });
  }, []);

  const filteredPolice = searchTerm
    ? police.filter(p =>
        (p['station_name'] && p['station_name'].includes(searchTerm)) ||
        (p['address'] && p['address'].includes(searchTerm))
      )
    : police;

  return (
    <div className="container">
      <header className="app-header">
        <Link to="/" className="back-link">← 리포트로 돌아가기</Link>
        <h1>우리동네 경찰서 검색</h1>
        <p>찾고 싶은 경찰서의 이름 또는 주소를 입력하세요.</p>
      </header>
      <div className="search-box">
        <input
          type="text"
          placeholder="예: 청주, 흥덕"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="list-container">
        {loading ? ( <p>데이터를 불러오는 중입니다...</p> ) : (
          <>
            <p className="result-count">총 {filteredPolice.length}개의 결과가 검색되었습니다.</p>
            <ul>
              {filteredPolice.map((station, index) => (
                <li key={index} className="police-card">
                  <div className="card-header">
                    <strong>{station.station_name}</strong>
                  </div>
                  <div className="card-body">
                    <p><strong>주소:</strong> {station.address}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default PoliceCheck;