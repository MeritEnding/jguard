import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Risk_Analysis.css'; // 새로운 CSS 파일을 임포트합니다.
import Header from './Header';
import { FaMapMarkedAlt, FaExclamationTriangle, FaChartBar, FaWonSign, FaPercent, FaBuilding } from 'react-icons/fa';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    tooltipAnchor: [16, -28], shadowSize: [41, 41]
});

// 데이터는 외부 JSON 파일로 관리한다고 가정합니다.
const chungbukComprehensiveData = [
    { region_sub: "청주시", incidents_23: 121, incidents_24: 236, incidents_25: 49, latest_accidents: 28, amount_krw: 5905500000, rate_percent: 3.2, apt_1yr: 81.8, apt_3m: 85.8, multi_1yr: 72.1, multi_3m: null },
    { region_sub: "충주시", incidents_23: 7, incidents_24: 15, incidents_25: 1, latest_accidents: 11, amount_krw: 1966000000, rate_percent: 8.8, apt_1yr: 78.7, apt_3m: 75.6, multi_1yr: 82.5, multi_3m: null },
    { region_sub: "제천시", incidents_23: 3, incidents_24: 2, incidents_25: 0, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 80.6, apt_3m: 81.1, multi_1yr: 98.1, multi_3m: null },
    { region_sub: "보은군", incidents_23: 32, incidents_24: 16, incidents_25: 2, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 54.9, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "옥천군", incidents_23: 0, incidents_24: 1, incidents_25: 0, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 69.9, apt_3m: 70.1, multi_1yr: 59.6, multi_3m: null },
    { region_sub: "영동군", incidents_23: 2, incidents_24: 5, incidents_25: 1, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 57.5, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "증평군", incidents_23: 18, incidents_24: 5, incidents_25: 0, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 80.5, apt_3m: 79.9, multi_1yr: null, multi_3m: null },
    { region_sub: "진천군", incidents_23: 1, incidents_24: 2, incidents_25: 1, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 77.8, apt_3m: 74.8, multi_1yr: 74.8, multi_3m: null },
    { region_sub: "괴산군", incidents_23: 1, incidents_24: 1, incidents_25: 0, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: null, apt_3m: null, multi_1yr: null, multi_3m: null },
    { region_sub: "음성군", incidents_23: 2, incidents_24: 20, incidents_25: 5, latest_accidents: 7, amount_krw: 705000000, rate_percent: 30.1, apt_1yr: 73.4, apt_3m: 74.5, multi_1yr: 73.1, multi_3m: null },
    { region_sub: "단양군", incidents_23: 0, incidents_24: 0, incidents_25: 0, latest_accidents: 0, amount_krw: 0, rate_percent: 0.0, apt_1yr: 81.2, apt_3m: null, multi_1yr: null, multi_3m: null }
];


const getRiskInfo = (value, metricType) => {
    if (value === null || value === undefined) return { level: '데이터 없음', color: 'nodata'};
    switch (metricType) {
        case 'rate_percent':
            if (value >= 10) return { level: '매우 높음', color: 'high' };
            if (value >= 5) return { level: '주의', color: 'medium' };
            if (value > 0) return { level: '보통', color: 'low' };
            return { level: '안전', color: 'safe' };
        case 'latest_accidents':
            if (value >= 10) return { level: '매우 높음', color: 'high' };
            if (value >= 5) return { level: '주의', color: 'medium' };
            if (value > 0) return { level: '보통', color: 'low' };
            return { level: '안전', color: 'safe' };
        case 'apt_3m':
        case 'multi_3m':
            if (value >= 90) return { level: '매우 높음', color: 'high' };
            if (value >= 80) return { level: '주의', color: 'medium' };
            if (value >= 70) return { level: '보통', color: 'low' };
            return { level: '안전', color: 'safe' };
        default:
            return { level: '데이터 없음', color: 'nodata' };
    }
};

const Spinner = () => <div className="spinner"></div>;

const RiskAnalysis = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('청주시');
    const [mapMetric, setMapMetric] = useState('rate_percent');
    const geoJsonRef = useRef(null);
    
    useEffect(() => {
        const fetchGeoJsonData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/chungbuk_sigungu_geojson.json');
                if (!response.ok) throw new Error('지도 데이터를 불러오는 데 실패했습니다.');
                const data = await response.json();
                setGeoJsonData(data);
            } catch (err) { setError(err.message); } 
            finally { setLoading(false); }
        };
        fetchGeoJsonData();
    }, []);
    
    const geoJsonStyle = (feature) => {
        const regionData = getRegionData(feature.properties.name);
        const value = regionData ? regionData[mapMetric] : null; 
        const risk = getRiskInfo(value, mapMetric);
        const riskColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981', safe: '#3B82F6', nodata: '#9CA3AF' };
        return {
            fillColor: riskColors[risk.color], weight: 1.5, opacity: 1, color: 'white', fillOpacity: 0.7
        };
    };
    
    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.clearLayers().addData(geoJsonData);
        }
    }, [mapMetric, geoJsonData]);
    
    const getRegionData = (sigunguName) => chungbukComprehensiveData.find(d => d.region_sub === sigunguName);

    const onEachFeature = (feature, layer) => {
        const sigunguName = feature.properties.name;
        layer.bindTooltip(sigunguName, { permanent: true, direction: 'center', className: 'map-label' });
        layer.on({
            mouseover: (e) => e.target.setStyle({ weight: 4, color: '#1A1A2E', fillOpacity: 0.9 }),
            mouseout: (e) => geoJsonRef.current.resetStyle(e.target),
            click: (e) => {
                setSelectedRegion(sigunguName);
                e.target._map.fitBounds(e.target.getBounds());
            }
        });
    };
    
    const currentRegionData = getRegionData(selectedRegion);

    const formatCurrency = (amount) => {
        if (!amount) return '0원';
        const 억 = Math.floor(amount / 100000000);
        const 만 = Math.floor((amount % 100000000) / 10000);
        if (억 > 0) return `${억.toLocaleString()}억 ${만 > 0 ? `${만.toLocaleString()}만원` : ''}`;
        return `${만.toLocaleString()}만원`;
    };

    return (
        <div className="risk-dashboard-light">
            <Header />
            <div className="content-wrapper">
                <div className="risk-analysis-header">
                    <h1>우리동네 전세사기 위험도 지도</h1>
                    <p>지도와 카드를 통해 충북 각 지역의 전세 위험도를 한눈에 파악하세요.</p>
                </div>

                <div className="metric-selector">
                    <button onClick={() => setMapMetric('rate_percent')} className={mapMetric === 'rate_percent' ? 'active' : ''}>
                        <FaPercent /> 보증 사고율
                    </button>
                    <button onClick={() => setMapMetric('latest_accidents')} className={mapMetric === 'latest_accidents' ? 'active' : ''}>
                        <FaExclamationTriangle /> 최신 사고 건수
                    </button>
                    <button onClick={() => setMapMetric('apt_3m')} className={mapMetric === 'apt_3m' ? 'active' : ''}>
                        <FaBuilding /> 아파트 전세가율
                    </button>
                </div>

                <main className="risk-analysis-main">
                    <div className="map-column">
                        {/* 지도 타일을 밝은 테마로 변경 */}
                        <MapContainer center={[36.8, 127.9]} zoom={9} className="leaflet-map-container" scrollWheelZoom={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                            {geoJsonData && <GeoJSON key={mapMetric} ref={geoJsonRef} data={geoJsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />}
                        </MapContainer>
                        <MapLegend metric={mapMetric}/>
                    </div>
                    <div className="info-column">
                       <div className="info-panel">
                            <div className="info-header">
                                <FaMapMarkedAlt />
                                <h2>{selectedRegion} 상세 리포트</h2>
                            </div>
                            {loading ? <div className="status-message"><Spinner /></div> : 
                             error ? <div className="status-message error"><FaExclamationTriangle/> {error}</div> :
                             currentRegionData ? (
                                <div className="info-content">
                                    <div className="kpi-grid">
                                        <KpiCard icon={<FaPercent/>} label="최신 사고율" value={`${currentRegionData.rate_percent}%`} />
                                        <KpiCard icon={<FaExclamationTriangle/>} label="최신 사고건수" value={`${currentRegionData.latest_accidents}건`} />
                                        <KpiCard icon={<FaWonSign/>} label="최신 사고금액" value={formatCurrency(currentRegionData.amount_krw)} />
                                    </div>
                                    <div className="detail-grid">
                                        <JeonseRateCard data={currentRegionData} />
                                        <YearlyTrendCard data={currentRegionData} />
                                    </div>
                                </div>
                             ) : (
                                <div className="status-message">지도에서 분석할 지역을 클릭해주세요.</div>
                             )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
// --- ▼▼▼ 추가된 부분: 동적 범례 컴포넌트 ▼▼▼ ---
const MapLegend = ({ metric }) => {
    let legendTitle = '';
    let legendItems = [];

    switch (metric) {
        case 'rate_percent':
            legendTitle = '보증 사고율 (%)';
            legendItems = [
                { color: '#e53e3e', label: '10% 이상 (매우 높음)' },
                { color: '#f6ad55', label: '5-10% (주의)' },
                { color: '#48bb78', label: '0-5% (보통)' },
                { color: '#4299e1', label: '0% (안전)' },
            ];
            break;
        case 'latest_accidents':
            legendTitle = '최신 사고 건수';
            legendItems = [
                { color: '#e53e3e', label: '10건 이상 (매우 높음)' },
                { color: '#f6ad55', label: '5-9건 (주의)' },
                { color: '#48bb78', label: '1-4건 (보통)' },
                { color: '#4299e1', label: '0건 (안전)' },
            ];
            break;
        case 'apt_3m':
            legendTitle = '아파트 전세가율 (%)';
            legendItems = [
                { color: '#e53e3e', label: '90% 이상 (매우 높음)' },
                { color: '#f6ad55', label: '80-90% (주의)' },
                { color: '#48bb78', label: '70-80% (보통)' },
                { color: '#4299e1', label: '70% 미만 (안전)' },
            ];
            break;
        default:
            legendTitle = '범례';
    }

    return (
        <div className="map-legend">
            <h4>{legendTitle}</h4>
            {legendItems.map(item => (
                <div key={item.label} className="legend-item">
                    <span style={{ backgroundColor: item.color }}></span>{item.label}
                </div>
            ))}
        </div>
    );
};
// --- ▲▲▲ 추가된 부분 끝 ▲▲▲ ---

const KpiCard = ({ icon, label, value }) => (
    <div className="kpi-card">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-info">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
        </div>
    </div>
);

const JeonseRateCard = ({ data }) => (
    <div className="detail-card">
        <h4><FaBuilding /> 주택 유형별 전세가율 (%)</h4>
        <div className="rate-breakdown">
            <div className="rate-column">
                <h5>아파트</h5>
                <p><span>최근 1년:</span> {data.apt_1yr || 'N/A'}</p>
                <p><span>최근 3개월:</span> {data.apt_3m || 'N/A'}</p>
            </div>
            <div className="rate-column">
                <h5>연립/다세대</h5>
                <p><span>최근 1년:</span> {data.multi_1yr || 'N/A'}</p>
                <p><span>최근 3개월:</span> {data.multi_3m || 'N/A'}</p>
            </div>
        </div>
    </div>
);

const YearlyTrendCard = ({ data }) => {
    const years = [data.incidents_23, data.incidents_24, data.incidents_25];
    const maxVal = Math.max(...years, 1);

    return(
        <div className="detail-card">
            <h4><FaChartBar /> 연도별 사고 건수 추세</h4>
            <div className="bar-chart">
                {years.map((val, index) => (
                    <div key={index} className="bar-item">
                        <div className="bar" style={{ height: `${(val / maxVal) * 100}%` }}>
                            <span className="bar-value">{val}</span>
                        </div>
                        <div className="bar-label">'{23 + index}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskAnalysis;