import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaExclamationTriangle, FaMapMarkedAlt } from 'react-icons/fa';
import { fetchRegionRisks } from '../api/riskApi';
import './RiskMap.css';

const LEVEL_COLORS = {
    '위험': '#DC2640',
    '주의': '#F59E0B',
    '보통': '#5661EC',
    '안전': '#10B981',
};

const RiskMap = () => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchRegionRisks();
                setRegions(res.data);
                if (res.data.length > 0) setSelected(res.data[0].sido);
            } catch (err) {
                console.error('위험지수 조회 실패:', err);
                setError('위험지수 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const summary = useMemo(() => {
        if (regions.length === 0) return null;
        const totalVictims = regions.reduce((acc, r) => acc + r.victimCount, 0);
        const avgScore = Math.round(regions.reduce((acc, r) => acc + r.riskScore, 0) / regions.length);
        return { top: regions[0], totalVictims, avgScore };
    }, [regions]);

    const selectedRegion = regions.find((r) => r.sido === selected);

    return (
        <div className="riskmap-page">
            <div className="page-head">
                <span className="page-eyebrow"><FaMapMarkedAlt /> 전국 위험지도</span>
                <h1>대한민국 전세사기 위험지도</h1>
                <p>
                    국토교통부 피해자 결정 현황과 한국부동산원 전세가율, HUG 보증사고율을
                    종합한 시도별 위험지수입니다.
                </p>
            </div>

            <div className="riskmap-content">
                {loading ? (
                    <div className="status-message"><div className="spinner" /> 데이터를 불러오는 중입니다...</div>
                ) : error ? (
                    <div className="status-message error"><FaExclamationTriangle /> {error}</div>
                ) : (
                    <>
                        {summary && (
                            <div className="riskmap-summary">
                                <div className="summary-tile card">
                                    <span className="tile-label">최고 위험 지역</span>
                                    <strong className="tile-value danger">{summary.top.sido}</strong>
                                    <span className="tile-sub">위험지수 {summary.top.riskScore}점 · {summary.top.riskLevel}</span>
                                </div>
                                <div className="summary-tile card">
                                    <span className="tile-label">전국 평균 위험지수</span>
                                    <strong className="tile-value">{summary.avgScore}점</strong>
                                    <span className="tile-sub">17개 시도 기준</span>
                                </div>
                                <div className="summary-tile card">
                                    <span className="tile-label">누적 피해 인정 인원</span>
                                    <strong className="tile-value">{summary.totalVictims.toLocaleString()}명</strong>
                                    <span className="tile-sub">전세사기피해지원위원회 결정 기준</span>
                                </div>
                            </div>
                        )}

                        <div className="riskmap-grid">
                            <div className="riskmap-map card">
                                <MapContainer center={[36.3, 127.8]} zoom={7} className="riskmap-leaflet">
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    {regions.map((r) => (
                                        <CircleMarker
                                            key={r.sido}
                                            center={[r.lat, r.lng]}
                                            radius={Math.max(10, Math.min(30, 10 + r.victimCount / 350))}
                                            pathOptions={{
                                                color: '#fff',
                                                weight: 1.5,
                                                fillColor: LEVEL_COLORS[r.riskLevel] || '#94A3B8',
                                                fillOpacity: 0.78,
                                            }}
                                            eventHandlers={{ click: () => setSelected(r.sido) }}
                                        >
                                            <Tooltip direction="top" offset={[0, -6]}>
                                                <strong>{r.sido}</strong> 위험지수 {r.riskScore}점 · 피해 {r.victimCount.toLocaleString()}명
                                            </Tooltip>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>
                                <div className="riskmap-legend">
                                    {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                                        <span className="legend-chip" key={level}>
                                            <i style={{ backgroundColor: color }} /> {level}
                                        </span>
                                    ))}
                                    <span className="legend-note">원 크기 = 피해자 수</span>
                                </div>
                            </div>

                            <div className="riskmap-rank card">
                                <h2>시도별 위험지수 순위</h2>
                                <ul>
                                    {regions.map((r, idx) => (
                                        <li
                                            key={r.sido}
                                            className={`rank-row ${selected === r.sido ? 'active' : ''}`}
                                            onClick={() => setSelected(r.sido)}
                                        >
                                            <span className="rank-no">{idx + 1}</span>
                                            <span className="rank-sido">{r.sido}</span>
                                            <div className="rank-bar">
                                                <i
                                                    style={{
                                                        width: `${r.riskScore}%`,
                                                        backgroundColor: LEVEL_COLORS[r.riskLevel],
                                                    }}
                                                />
                                            </div>
                                            <span className="rank-score" style={{ color: LEVEL_COLORS[r.riskLevel] }}>
                                                {r.riskScore}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {selectedRegion && (
                            <div className="riskmap-detail card">
                                <div className="detail-head">
                                    <h2>{selectedRegion.sido}</h2>
                                    <span
                                        className="detail-level"
                                        style={{ backgroundColor: LEVEL_COLORS[selectedRegion.riskLevel] }}
                                    >
                                        {selectedRegion.riskLevel} · {selectedRegion.riskScore}점
                                    </span>
                                </div>
                                <div className="detail-metrics">
                                    <div className="metric">
                                        <span className="metric-label">아파트 전세가율</span>
                                        <strong>{selectedRegion.jeonseRatioApt}%</strong>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">연립·다세대 전세가율</span>
                                        <strong>{selectedRegion.jeonseRatioVilla}%</strong>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">HUG 보증사고율</span>
                                        <strong>{selectedRegion.hugAccidentRate}%</strong>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">피해 인정 인원</span>
                                        <strong>{selectedRegion.victimCount.toLocaleString()}명</strong>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">전국 대비 비중</span>
                                        <strong>{selectedRegion.share}%</strong>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">통계 기준</span>
                                        <strong>{selectedRegion.basisDate}</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RiskMap;
