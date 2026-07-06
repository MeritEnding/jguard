import axiosInstance from './axiosInstance';

export const fetchFraudCasesByRegion = (city, district, neighborhood) =>
    axiosInstance.get('/api/fraud/region', {
        params: { city, district, neighborhood },
    });
