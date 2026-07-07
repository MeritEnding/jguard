import React, { useState } from 'react';
import { FaRobot, FaExclamationTriangle, FaCheckCircle, FaRedoAlt } from 'react-icons/fa';
import { predictRisk } from '../api/riskApi';
import './RiskCheck.css';
import mascotCheck from '../assets/mascot/check.png';
import mascotSafe from '../assets/mascot/safe.png';
import mascotGood from '../assets/mascot/good.png';
import mascotCaution from '../assets/mascot/caution.png';
import mascotDanger from '../assets/mascot/danger.png';

const LEVEL_MASCOTS = {
    '위험': mascotDanger,
    '주의': mascotCaution,
    '보통': mascotGood,
    '안전': mascotSafe,
};

const SIDO_LIST = [
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const HOUSING_TYPES = [
    { value: 'villa', label: '연립·다세대(빌라)' },
    { value: 'officetel', label: '오피스텔' },
    { value: 'apartment', label: '아파트' },
];

const LEVEL_COLORS = {
    '위험': 'var(--danger-600)',
    '주의': 'var(--warn-600)',
    '보통': 'var(--brand-600)',
    '안전': 'var(--safe-600)',
};

const initialForm = {
    deposit: '',
    marketPrice: '',
    seniorDebt: '',
    housingType: 'villa',
    sido: '서울',
    hasInsurance: false,
    taxArrears: false,
    ownerChanged: false,
};

const RiskCheck = () => {
    const [form, setForm] = useState(initialForm);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.deposit || !form.marketPrice) {
            setError('보증금과 매매 시세를 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await predictRisk({
                deposit: Number(form.deposit),
                marketPrice: Number(form.marketPrice),
                seniorDebt: Number(form.seniorDebt || 0),
                housingType: form.housingType,
                sido: form.sido,
                hasInsurance: form.hasInsurance,
                taxArrears: form.taxArrears,
                ownerChanged: form.ownerChanged,
            });
            setResult(res.data);
        } catch (err) {
            console.error('위험 진단 실패:', err);
            setError(err.response?.data?.message || '진단 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="riskcheck-page">
            <div className="page-head">
                <span className="page-eyebrow"><FaRobot /> AI 위험 진단</span>
                <h1>딥러닝 기반 전세사기 위험 진단</h1>
                <p>
                    공공데이터로 학습한 딥러닝 모델(테스트 정확도 96.4%)이 계약 정보를 분석해
                    보증금 미반환 위험을 예측합니다.
                </p>
            </div>

            <div className="riskcheck-content">
                {!result ? (
                    <form className="riskcheck-form card" onSubmit={handleSubmit}>
                        <div className="form-mascot-row">
                            <img src={mascotCheck} alt="체크리스트를 든 제이가드" />
                            <p>아는 정보만 입력해도 괜찮아요. 제이가드가 꼼꼼히 확인해볼게요!</p>
                        </div>
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="deposit">전세 보증금 (만원)</label>
                                <input
                                    id="deposit" name="deposit" type="number" min="1"
                                    placeholder="예: 19000"
                                    value={form.deposit} onChange={handleChange} required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="marketPrice">주택 매매 시세 (만원)</label>
                                <input
                                    id="marketPrice" name="marketPrice" type="number" min="1"
                                    placeholder="예: 22000"
                                    value={form.marketPrice} onChange={handleChange} required
                                />
                                <span className="form-hint">국토부 실거래가·KB시세 등에서 확인한 금액</span>
                            </div>
                            <div className="form-field">
                                <label htmlFor="seniorDebt">선순위 채권 총액 (만원)</label>
                                <input
                                    id="seniorDebt" name="seniorDebt" type="number" min="0"
                                    placeholder="근저당이 없으면 0"
                                    value={form.seniorDebt} onChange={handleChange}
                                />
                                <span className="form-hint">등기부등본 을구의 근저당·전세권 설정액</span>
                            </div>
                            <div className="form-field">
                                <label htmlFor="housingType">주택 유형</label>
                                <div className="select-wrapper">
                                    <select id="housingType" name="housingType" value={form.housingType} onChange={handleChange}>
                                        {HOUSING_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="sido">지역 (시도)</label>
                                <div className="select-wrapper">
                                    <select id="sido" name="sido" value={form.sido} onChange={handleChange}>
                                        {SIDO_LIST.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="check-group">
                            <label className="check-item">
                                <input type="checkbox" name="hasInsurance" checked={form.hasInsurance} onChange={handleChange} />
                                <span>전세보증금 반환보증에 가입했거나 가입 예정입니다</span>
                            </label>
                            <label className="check-item">
                                <input type="checkbox" name="taxArrears" checked={form.taxArrears} onChange={handleChange} />
                                <span>임대인에게 국세·지방세 체납이 있습니다 (또는 확인을 거부했습니다)</span>
                            </label>
                            <label className="check-item">
                                <input type="checkbox" name="ownerChanged" checked={form.ownerChanged} onChange={handleChange} />
                                <span>계약 직전(1년 이내) 주택의 소유권이 변경되었습니다</span>
                            </label>
                        </div>

                        {error && <div className="form-error"><FaExclamationTriangle /> {error}</div>}

                        <button type="submit" className="btn btn-primary btn-lg riskcheck-submit" disabled={loading}>
                            {loading ? <div className="spinner" /> : <><FaRobot /> AI 진단 시작</>}
                        </button>
                    </form>
                ) : (
                    <div className="riskcheck-result">
                        <div className="result-score-card card">
                            <div
                                className="result-ring"
                                style={{
                                    background: `radial-gradient(closest-side, var(--bg-surface) 74%, transparent 75% 100%),
                                        conic-gradient(${LEVEL_COLORS[result.riskLevel]} 0 ${result.riskScore}%, var(--bg-subtle) ${result.riskScore}% 100%)`,
                                }}
                            >
                                <strong style={{ color: LEVEL_COLORS[result.riskLevel] }}>{result.riskScore}</strong>
                                <span>/100</span>
                            </div>
                            <img
                                src={LEVEL_MASCOTS[result.riskLevel] || mascotGood}
                                alt={`${result.riskLevel} 등급 마스코트`}
                                className="result-mascot"
                            />
                            <div className="result-summary">
                                <span className="result-level" style={{ backgroundColor: LEVEL_COLORS[result.riskLevel] }}>
                                    위험 등급 · {result.riskLevel}
                                </span>
                                <h2>위험 확률 {result.probability}%</h2>
                                <p>{result.summary}</p>
                                <span className="result-model">딥러닝 MLP 모델 · 테스트 정확도 {(result.modelAccuracy * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        <div className="result-factors card">
                            <h3>요인별 진단</h3>
                            <ul>
                                {result.factors.map((f) => (
                                    <li key={f.name} className={`factor-row ${f.status}`}>
                                        <div className="factor-head">
                                            <span className="factor-name">{f.name}</span>
                                            <span className={`factor-value ${f.status}`}>{f.value}</span>
                                        </div>
                                        <p>{f.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="result-recs card">
                            <h3>지금 해야 할 일</h3>
                            <ul>
                                {result.recommendations.map((rec, i) => (
                                    <li key={i}><FaCheckCircle /> {rec}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="result-actions">
                            <button className="btn btn-outline btn-lg" onClick={handleReset}>
                                <FaRedoAlt /> 다시 진단하기
                            </button>
                        </div>

                        <p className="result-disclaimer">
                            본 진단 결과는 공공데이터 기반 참고 자료이며 법적 효력을 갖지 않습니다.
                            중요한 계약 결정 전에는 전세피해지원센터(☎ 1533-8119) 또는 전문가와 상담하세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskCheck;
