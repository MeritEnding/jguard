import axiosInstance from './axiosInstance';

export const fetchNews = () =>
    axiosInstance.get('/api/news');

export const fetchKeywordTrend = () =>
    axiosInstance.get('/api/trend');

export const fetchChungbukNews = () =>
    axiosInstance.get('/api/chungbuk_news');
