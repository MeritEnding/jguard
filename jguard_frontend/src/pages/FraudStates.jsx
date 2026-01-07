import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { FaChartBar, FaMapMarkerAlt, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import './FraudStates.css';

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
    shadowSize: [41, 41],
});

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

// 발생 건수 구간별 지도 마커 색 (디자인 토큰의 semantic 색상)
const getMarkerColor = (count) => {
    if (count >= 100) return '#DC2640';
    if (count >= 10) return '#F59E0B';
    if (count > 0) return '#FBBF24';
    return '#10B981';
};

// 추이 차트 고정 시리즈 (누적 발생 건수 상위 3개 지역, 색상 순서 고정)
const TREND_REGIONS = [
    { region: '청주', color: '#4F46E5' },
    { region: '보은', color: '#F59E0B' },
    { region: '음성', color: '#10B981' },
];

const chartTooltipStyle = {
    borderRadius: 12,
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    fontSize: 13,
};

export default function FraudStates() {
    const [year, setYear] = useState('2024');

    const { barData, total, topRegion, yoyDiff, trendData } = useMemo(() => {
        const selected = regionData.find((d) => d.year === year)?.data || {};
        const bar = Object.entries(selected)
            .map(([region, count]) => ({ region, count }))
            .sort((a, b) => b.count - a.count);

        const sum = (data) => Object.values(data).reduce((acc, v) => acc + v, 0);
        const totalCount = sum(selected);
        const top = bar[0];

        const prev = regionData.find((d) => d.year === String(Number(year) - 1));
        const diff = prev ? totalCount - sum(prev.data) : null;

        const trend = regionData.map((d) => ({
            year: d.year,
            ...TREND_REGIONS.reduce((obj, { region }) => ({ ...obj, [region]: d.data[region] }), {}),
        }));

        return { barData: bar, total: totalCount, topRegion: top, yoyDiff: diff, trendData: trend };
    }, [year]);

    return (
        <div className="fraud-states-page">
            <div className="page-head">
                <span className="page-eyebrow"><FaChartBar /> 피해 현황 통계</span>
                <h1>충북 전세사기 피해 현황</h1>
                <p>연도별·지역별 전세사기 발생 건수를 지도와 차트로 확인하세요.</p>
            </div>

            <div className="fs-year-toggle" role="tablist" aria-label="조회 연도">
                {regionData.map((d) => (
                    <button
                        key={d.year}
                        role="tab"
                        aria-selected={year === d.year}
                        className={`fs-year-btn ${year === d.year ? 'active' : ''}`}
                        onClick={() => setYear(d.year)}
                    >
                        {d.year}년
                    </button>
                ))}
            </div>

            <div className="fs-stat-row">
                <div className="fs-stat-tile card">
                    <span className="fs-stat-label">{year}년 총 발생 건수</span>
                    <strong className="fs-stat-value">{total.toLocaleString()}건</strong>
                </div>
                <div className="fs-stat-tile card">
                    <span className="fs-stat-label">최다 발생 지역</span>
                    <strong className="fs-stat-value"><FaMapMarkerAlt className="fs-stat-icon" /> {topRegion?.region} ({topRegion?.count}건)</strong>
                </div>
                <div className="fs-stat-tile card">
                    <span className="fs-stat-label">전년 대비</span>
                    <strong className={`fs-stat-value ${yoyDiff > 0 ? 'up' : yoyDiff < 0 ? 'down' : ''}`}>
                        {yoyDiff === null ? <><FaMinus className="fs-stat-icon" /> 데이터 없음</>
                            : yoyDiff > 0 ? <><FaArrowUp className="fs-stat-icon" /> +{yoyDiff}건</>
                            : yoyDiff < 0 ? <><FaArrowDown className="fs-stat-icon" /> {yoyDiff}건</>
                            : <><FaMinus className="fs-stat-icon" /> 변동 없음</>}
                    </strong>
                </div>
            </div>

            <div className="fs-grid">
                <div className="fs-card card">
                    <h2 className="fs-card-title">지역별 발생 지도</h2>
                    <div className="fs-map-wrapper">
                        <MapContainer center={{ lat: 36.8, lng: 127.7 }} zoom={9} className="fs-map">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {barData.map(({ region, count }) => (
                                regionCoords[region] && (
                                    <CircleMarker
                                        key={region}
                                        center={regionCoords[region]}
                                        radius={Math.max(8, Math.min(25, count / 10))}
                                        pathOptions={{
                                            color: getMarkerColor(count),
                                            fillColor: getMarkerColor(count),
                                            fillOpacity: 0.65,
                                            weight: 2,
                                        }}
                                    >
                                        <Popup>
                                            <div className="fs-popup">{region}: <strong>{count}건</strong></div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                    <div className="fs-legend">
                        <span><i style={{ background: '#DC2640' }} /> 100건 이상</span>
                        <span><i style={{ background: '#F59E0B' }} /> 10~99건</span>
                        <span><i style={{ background: '#FBBF24' }} /> 1~9건</span>
                        <span><i style={{ background: '#10B981' }} /> 0건</span>
                    </div>
                </div>

                <div className="fs-card card">
                    <h2 className="fs-card-title">{year}년 지역별 발생 건수</h2>
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={barData} margin={{ top: 24, right: 16, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                            <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.06)' }} contentStyle={chartTooltipStyle} formatter={(v) => [`${v}건`, '발생 건수']} />
                            <Bar dataKey="count" fill="#4F46E5" name="발생 건수" radius={[4, 4, 0, 0]} maxBarSize={36}>
                                <LabelList dataKey="count" position="top" formatter={(v) => (v >= 10 ? v : '')} style={{ fontSize: 12, fill: 'var(--text-body)' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="fs-card card fs-trend-card">
                <h2 className="fs-card-title">주요 지역 연도별 추이</h2>
                <p className="fs-card-desc">누적 발생 건수 상위 3개 지역의 연도별 변화입니다.</p>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData} margin={{ top: 12, right: 32, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(v, name) => [`${v}건`, name]} />
                        <Legend wrapperStyle={{ fontSize: 13 }} />
                        {TREND_REGIONS.map(({ region, color }) => (
                            <Line
                                key={region}
                                type="monotone"
                                dataKey={region}
                                stroke={color}
                                strokeWidth={2}
                                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
