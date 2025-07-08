import React, { useState, useEffect } from 'react';
import Header from './Header';
import regions from './data/regions';
import './FraudCaseLookup.css'; // ✨ 완전히 새로워진 CSS
// ✨ axiosInstance를 사용하도록 수정
import axiosInstance from './api/axiosInstance'; 
import { FaSearch, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';

// 로딩 스피너 컴포넌트
const Spinner = () => <div className="spinner"></div>;

const FraudCaseLookup = () => {
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [fraudCases, setFraudCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchAttempted, setSearchAttempted] = useState(false);

    // 시/군/구 선택에 따른 하위 메뉴 업데이트 로직 (기존과 동일)
    useEffect(() => {
        if (selectedCity) {
            setDistricts(Object.keys(regions[selectedCity]));
        } else {
            setDistricts([]);
        }
        setSelectedDistrict('');
        setNeighborhoods([]);
        setSelectedNeighborhood('');
        setFraudCases([]);
        setSearchAttempted(false);
    }, [selectedCity]);

    useEffect(() => {
        if (selectedCity && selectedDistrict) {
            setNeighborhoods(regions[selectedCity][selectedDistrict]);
        } else {
            setNeighborhoods([]);
        }
        setSelectedNeighborhood('');
        setFraudCases([]);
        setSearchAttempted(false);
    }, [selectedCity, selectedDistrict]);

    // ✨ handleSubmit 함수를 axiosInstance를 사용하도록 수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCity || !selectedDistrict || !selectedNeighborhood) {
            setError("시, 구, 동을 모두 선택해주세요.");
            return;
        }
        setLoading(true);
        setError(null);
        setFraudCases([]);
        setSearchAttempted(true);

        try {
            const response = await axiosInstance.get('/api/fraud/region', {
                params: {
                    city: selectedCity,
                    district: selectedDistrict,
                    neighborhood: selectedNeighborhood
                }
            });
            setFraudCases(response.data);
        } catch (err) {
            console.error("전세 사기 이력 조회 중 오류 발생:", err);
            setError(err.response?.data?.message || "이력을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lookup-page-container">
            <Header />
            <div className="lookup-hero-section">
                <h1>내 지역 전세사기 조회</h1>
                <p>지역을 선택하여 해당 지역에 등록된 사기 사례를 미리 확인하고 피해를 예방하세요.</p>
            </div>

            <main className="lookup-main-content">
                <form onSubmit={handleSubmit} className="fraud-form">
                    <div className="select-wrapper">
                        <select id="city-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value="">시/도 선택</option>
                            {Object.keys(regions).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div className="select-wrapper">
                        <select id="district-select" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedCity}>
                            <option value="">시/군/구 선택</option>
                            {districts.map(district => <option key={district} value={district}>{district}</option>)}
                        </select>
                    </div>
                    <div className="select-wrapper">
                        <select id="neighborhood-select" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} disabled={!selectedDistrict}>
                            <option value="">읍/면/동 선택</option>
                            {neighborhoods.map(neighborhood => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading || !selectedNeighborhood}>
                        {loading ? <Spinner /> : <><FaSearch /> 조회하기</>}
                    </button>
                </form>

                <div className="results-section">
                    {error && (
                        <div className="status-message error">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="status-message loading">
                            <Spinner /> 이력을 불러오는 중입니다...
                        </div>
                    ) : searchAttempted && !error && fraudCases.length === 0 ? (
                        <div className="status-message no-results">
                            <FaFileAlt />
                            <p><strong>{selectedCity} {selectedDistrict} {selectedNeighborhood}</strong></p>
                            <p>해당 지역에 등록된 전세사기 이력이 없습니다.</p>
                        </div>
                    ) : fraudCases.length > 0 && (
                        <div className="fraud-results-container">
                            <h2>"{selectedCity} {selectedDistrict} {selectedNeighborhood}" 조회 결과 <span className="results-count">{fraudCases.length}</span>건</h2>
                            <div className="fraud-grid">
                                {fraudCases.map((caseItem) => (
                                    <div key={caseItem.id} className="fraud-card">
                                        <div className="fraud-card-header">
                                            <span className={`fraud-type-tag type-${caseItem.fraudType?.length % 5}`}>{caseItem.fraudType}</span>
                                            <span className="fraud-date">{caseItem.date}</span>
                                        </div>
                                        <div className="fraud-card-body">
                                            <p><strong>주소:</strong> {`${caseItem.city} ${caseItem.district} ${caseItem.neighborhood} ${caseItem.address}`}</p>
                                            <p><strong>피해자 수:</strong> {caseItem.victimCount}명</p>
                                        </div>
                                        {caseItem.articleUrl && (
                                            <div className="fraud-card-footer">
                                                <a href={caseItem.articleUrl} target="_blank" rel="noopener noreferrer">관련 기사 보기 &rarr;</a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FraudCaseLookup;