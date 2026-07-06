import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RiskAnalysis.css';
import Header from '../components/Header';
import { FaMapMarkedAlt, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

// Leaflet 기본 마커 아이콘 설정 (필수!)
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
    iconSize: [25, 41], iconAnchor: [12, 41],
    popupAnchor: [1, -34], tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

// --- 대한민국 시도 GeoJSON 데이터 ... (기존과 동일)
const koreaGeoJSON = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "name": "충청북도" }, "geometry": { "type": "Polygon", "coordinates": [[[127.35,36.6],[127.4,36.8],[127.6,37.0],[128.0,37.1],[128.3,36.9],[128.4,36.6],[128.0,36.4],[127.7,36.3],[127.5,36.3],[127.35,36.6]]]}},
        { "type": "Feature", "properties": { "name": "대전광역시" }, "geometry": { "type": "Polygon", "coordinates": [[[127.3,36.3],[127.45,36.3],[127.45,36.4],[127.3,36.4],[127.3,36.3]]]}},
        { "type": "Feature", "properties": { "name": "서울특별시" }, "geometry": { "type": "Polygon", "coordinates": [[[126.8,37.45],[127.2,37.45],[127.2,37.7],[126.8,37.7],[126.8,37.45]]]}},
        { "type": "Feature", "properties": { "name": "경기도" }, "geometry": { "type": "Polygon", "coordinates": [[[126.7,37.1],[127.6,37.1],[127.6,38.2],[126.7,38.2],[126.7,37.1]]]}},
        { "type": "Feature", "properties": { "name": "부산광역시" }, "geometry": { "type": "Polygon", "coordinates": [[[128.9,35.0],[129.3,35.0],[129.3,35.3],[128.9,35.3],[128.9,35.0]]]}},
        { "type": "Feature", "properties": { "name": "대구광역시" }, "geometry": { "type": "Polygon", "coordinates": [[[128.4,35.7],[128.8,35.7],[128.8,36.0],[128.4,36.0],[128.4,35.7]]]}},
        { "type": "Feature", "properties": { "name": "세종특별자치시" }, "geometry": { "type": "Polygon", "coordinates": [[[127.2,36.45],[127.4,36.45],[127.4,36.6],[127.2,36.6],[127.2,36.45]]]}},
    ]
};

const getRiskInfo = (rate) => {
    if (rate >= 80) return { level: '매우 높음', color: 'high', icon: '🔴' };
    if (rate >= 70) return { level: '주의', color: 'medium', icon: '🟠' };
    if (rate >= 60) return { level: '보통', color: 'low', icon: '🟢' };
    return { level: '안전', color: 'safe', icon: '⚪' };
};

const Spinner = () => <div className="spinner"></div>;

const RiskAnalysis = () => {
    // ... (모든 useState, useEffect, 함수 로직은 기존과 동일) ...
    const [jeonseData, setJeonseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('충청북도');
    const geoJsonRef = useRef(null);
    
    useEffect(() => {
        const fetchJeonseData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockJeonseData = [
                    { region: "충청북도", type: "아파트", latest3Months: 77.4, latest1Year: 75.9 },
                    { region: "충청북도", type: "연립/다세대", latest3Months: 82.5, latest1Year: 81.5 },
                    { region: "대전광역시", type: "아파트", latest3Months: 68.0, latest1Year: 67.0 },
                    { region: "대전광역시", type: "연립/다세대", latest3Months: 72.0, latest1Year: 70.0 },
                    { region: "세종특별자치시", type: "아파트", latest3Months: 65.0, latest1Year: 62.0 },
                    { region: "서울특별시", type: "아파트", latest3Months: 71.0, latest1Year: 72.5 },
                    { region: "서울특별시", type: "연립/다세대", latest3Months: 79.0, latest1Year: 78.0 },
                    { region: "경기도", type: "아파트", latest3Months: 75.0, latest1Year: 73.0 },
                    { region: "경기도", type: "연립/다세대", latest3Months: 81.0, latest1Year: 80.0 },
                    { region: "부산광역시", type: "아파트", latest3Months: 69.0, latest1Year: 70.0 },
                    { region: "대구광역시", type: "아파트", latest3Months: 62.0, latest1Year: 65.0 },
                ];
                setJeonseData(mockJeonseData);
            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchJeonseData();
    }, []);

    const getRegionJeonseRate = (regionName) => {
        const regionData = jeonseData.filter(d => d.region === regionName);
        if (regionData.length === 0) return null;
        const avgRate = regionData.reduce((acc, item) => acc + item.latest3Months, 0) / regionData.length;
        return avgRate;
    };
    
    const geoJsonStyle = (feature) => {
        const rate = getRegionJeonseRate(feature.properties.name);
        const risk = getRiskInfo(rate);
        const riskColors = {
            high: '#e53e3e', medium: '#dd6b20', low: '#38a169', safe: '#3182ce'
        };
        return {
            fillColor: riskColors[risk.color] || '#cbd5e0',
            weight: 1, opacity: 1, color: 'white',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature, layer) => {
        const regionName = feature.properties.name;
        const rate = getRegionJeonseRate(regionName);
        const risk = getRiskInfo(rate);
        
        let popupContent = `<h3>${regionName}</h3>`;
        if (rate) {
            popupContent += `<strong>평균 전세가율: ${rate.toFixed(1)}%</strong><br/>`;
            popupContent += `위험도: ${risk.icon} ${risk.level}`;
        } else {
            popupContent += "데이터 없음";
        }
        layer.bindPopup(popupContent);

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({ weight: 3, color: '#2c3e50', fillOpacity: 0.9 });
                e.target.bringToFront();
            },
            mouseout: (e) => {
                if (geoJsonRef.current) {
                    geoJsonRef.current.resetStyle(e.target);
                }
            },
            click: () => {
                setSelectedRegion(regionName);
            }
        });
    };
    
    const currentRegionData = jeonseData.filter(item => item.region === selectedRegion);

    return (
        // ✨ FIX: 최상위 div에 고유 클래스 이름 적용
        <div className="risk-analysis-page">
            <Header />
            <div className="risk-analysis-header">
                <h1>전세가율 위험도 분석</h1>
                <p>지도와 데이터를 통해 전국 각 지역의 전세 위험도를 한눈에 파악하세요.</p>
            </div>
            <main className="risk-analysis-main">
                <div className="map-column">
                    <MapContainer center={[36.5, 127.8]} zoom={7} className="leaflet-map-container">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <GeoJSON ref={geoJsonRef} data={koreaGeoJSON} style={geoJsonStyle} onEachFeature={onEachFeature} />
                    </MapContainer>
                    <div className="map-legend">
                        <h4>위험도 범례</h4>
                        <div className="legend-item"><span style={{ backgroundColor: '#e53e3e' }}></span>80% 이상 (매우 높음)</div>
                        <div className="legend-item"><span style={{ backgroundColor: '#dd6b20' }}></span>70-80% (주의)</div>
                        <div className="legend-item"><span style={{ backgroundColor: '#38a169' }}></span>60-70% (보통)</div>
                        <div className="legend-item"><span style={{ backgroundColor: '#3182ce' }}></span>60% 미만 (안전)</div>
                    </div>
                </div>
                <div className="info-column">
                   {/* ... info-column 내용은 기존과 동일 ... */}
                   <div className="info-panel">
                        <div className="info-header">
                            <FaMapMarkedAlt />
                            <h2>지역별 상세 분석</h2>
                        </div>
                        <div className="region-selector">
                            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                                {[...new Set(jeonseData.map(item => item.region))].map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <FaChevronDown className="select-arrow" />
                        </div>

                        {loading ? <div className="status-message"><Spinner /></div> : 
                         error ? <div className="status-message error"><FaExclamationTriangle/> {error}</div> :
                         currentRegionData.length > 0 ? (
                            <div className="info-cards-container">
                                {currentRegionData.map((item, index) => {
                                    const riskInfo = getRiskInfo(item.latest3Months);
                                    const trend = item.latest3Months - item.latest1Year;
                                    return (
                                        <div key={index} className={`info-card ${riskInfo.color}`}>
                                            <h3 className="card-title">{item.type}</h3>
                                            <div className="card-main-info">
                                                <div className={`risk-level-icon ${riskInfo.color}`}>{riskInfo.icon}</div>
                                                <div className="rate-info">
                                                    <span className="rate-number">{item.latest3Months.toFixed(1)}%</span>
                                                    <span className="rate-label">최근 3개월 전세가율</span>
                                                </div>
                                            </div>
                                            <div className="card-footer-info">
                                                <span className="risk-level-text">위험도: <strong>{riskInfo.level}</strong></span>
                                                <span className={`trend-indicator ${trend > 1 ? 'up' : trend < -1 ? 'down' : 'stable'}`}>
                                                    {trend > 1 ? '▲' : trend < -1 ? '▼' : '▬'} {trend.toFixed(1)}%p (1년 전 대비)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="status-message">선택된 지역의 데이터가 없습니다.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RiskAnalysis;
