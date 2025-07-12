import React, { useState, useEffect } from 'react';
import './Property_check.css';

function Property_check() {
  const [realtors, setRealtors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 컴포넌트가 처음 로드될 때 JSON 파일을 불러옵니다.
  useEffect(() => {
    fetch('/chungbuk_realtors.json') // public 폴더의 파일 경로
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return response.json();
      })
      .then(data => {
        setRealtors(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("데이터를 불러오는 데 실패했습니다:", error);
        setLoading(false);
      });
  }, []); // 빈 배열을 전달하여 한 번만 실행되도록 설정

  // 검색어에 따라 중개업소 목록을 필터링합니다.
  const filteredRealtors = searchTerm
    ? realtors.filter(r =>
        (r['중개업소명'] && r['중개업소명'].includes(searchTerm)) ||
        (r['도로명주소(지번)'] && r['도로명주소(지번)'].includes(searchTerm))
      )
    : realtors;

  return (
    <div className="container">
      <h1>우리동네 부동산 중개업소 검색</h1>
      <p>찾고 싶은 중개업소의 상호 또는 주소를 입력하세요.</p>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="예: 한국, 청주시"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="list-container">
        {loading ? (
          <p>데이터를 불러오는 중입니다...</p>
        ) : (
          <>
            <p className="result-count">총 {filteredRealtors.length}개의 결과가 검색되었습니다.</p>
            <ul>
              {filteredRealtors.map((realtor, index) => (
                <li key={index} className="realtor-card">
                  <div className="card-header">
                    <strong>{realtor['중개업소명']}</strong>
                    <span className="realtor-type">{realtor['중개업소 구분']}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>대표:</strong> {realtor['중개업자명']}</p>
                    <p><strong>주소:</strong> {realtor['도로명주소(지번)']}</p>
                    <p><strong>등록번호:</strong> {realtor['등록번호']}</p>
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

export default Property_check;