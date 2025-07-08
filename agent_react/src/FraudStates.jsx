import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet 기본 CSS는 유지

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 생성할 FraudMapAndChart.css 파일을 임포트합니다.
import './FraudStates.css'; 

// Leaflet 기본 마커 아이콘 설정 (필수!)
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const regionData = [
    { year: '2023', data: { 청주: 55, 충주: 7, 제천: 3, 보은: 32, 옥천: 0, 영동: 2, 증평: 18, 진천: 1, 괴산: 1, 음성: 2 } },
    { year: '2024', data: { 청주: 236, 충주: 15, 제천: 2, 보은: 16, 옥천: 1, 영동: 5, 증평: 5, 진천: 2, 괴산: 1, 음성: 20 } },
    { year: '2025', data: { 청주: 49, 충주: 1, 제천: 0, 보은: 2, 옥천: 0, 영동: 1, 증평: 0, 진천: 1, 괴산: 0, 음성: 5 } },
];

const regionCoords = {
    청주: { lat: 36.6424, lng: 127.489 },
    충주: { lat: 36.991, lng: 127.925 },
    제천: { lat: 37.1326, lng: 128.1906 },
    보은: { lat: 36.489, lng: 127.729 },
    옥천: { lat: 36.3072, lng: 127.571 },
    영동: { lat: 36.175, lng: 127.775 },
    증평: { lat: 36.784, lng: 127.581 },
    진천: { lat: 36.854, lng: 127.439 },
    괴산: { lat: 36.815, lng: 127.788 },
    음성: { lat: 36.983, lng: 127.689 },
};

const getColor = (count) => {
    if (count >= 100) return 'red';
    if (count >= 10) return 'orange';
    if (count > 0) return 'yellow';
    return 'green';
};

export default function FraudMap() {
    const [year, setYear] = useState('2024');
    const selectedYearData = regionData.find((d) => d.year === year)?.data || {};

    const barData = Object.entries(selectedYearData).map(([region, count]) => ({ region, count }));

    const initialCenter = { lat: 36.8, lng: 127.7 };
    const initialZoom = 9;

    return (
        <div className="fraud-layout-container"> {/* 전체 레이아웃 컨테이너 */}
            <h1 className="fraud-layout-main-title">전세 사기 위험 알림 서비스</h1> {/* 메인 타이틀 추가 */}
            
            <div className="fraud-layout-content-wrapper"> {/* 양 옆으로 배치될 콘텐츠 래퍼 */}
                {/* 지도 카드 */}
                <div className="fraud-layout-card fraud-layout-map-card">
                    <h2 className="fraud-layout-card-title">지역별 사기 발생 지도</h2> {/* 지도 섹션 제목 */}

                    <div className="fraud-layout-year-select-container">
                        <label htmlFor="year-select" className="fraud-layout-year-select-label">조회 연도 선택:</label>
                        <select
                            id="year-select"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="fraud-layout-year-select"
                        >
                            {regionData.map((d) => (
                                <option key={d.year} value={d.year} className="fraud-layout-year-option">{d.year}년</option>
                            ))}
                        </select>
                    </div>

                    <div className="fraud-layout-map-wrapper">
                        <MapContainer center={initialCenter} zoom={initialZoom} className="fraud-layout-map">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            />

                            {Object.entries(selectedYearData).map(([region, count]) => (
                                regionCoords[region] && (
                                    <CircleMarker
                                        key={region}
                                        center={regionCoords[region]}
                                        radius={Math.max(8, Math.min(25, count / 10))}
                                        pathOptions={{ color: getColor(count), fillColor: getColor(count), fillOpacity: 0.7, weight: 1 }}
                                    >
                                        <Popup>
                                            <div className="fraud-layout-popup-content">
                                                {region}: <span className="fraud-layout-popup-count">{count}건</span>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* 차트 카드 */}
                <div className="fraud-layout-card-fraud-layout-chart-card">
                    <h2 className="fraud-layout-card-title">연도별 지역별 사기 발생 건수</h2> {/* 차트 섹션 제목 */}
                    <ResponsiveContainer width="100%" height={400}> {/* 차트 높이 조정 */}
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="region" axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                labelStyle={{ color: '#333' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="count"
                                fill="#f97316"
                                name="발생 건수"
                                radius={[10, 10, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}