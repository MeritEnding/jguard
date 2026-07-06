import axiosInstance from './axiosInstance';

/** 시도별 종합 위험지수 조회 (전국 위험지도) */
export const fetchRegionRisks = () => axiosInstance.get('/api/risk/regions');

/** AI(딥러닝) 계약 위험 진단 */
export const predictRisk = (payload) => axiosInstance.post('/api/risk/predict', payload);
