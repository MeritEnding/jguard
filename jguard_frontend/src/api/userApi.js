import axiosInstance from './axiosInstance';

export const login = (username, password) =>
    axiosInstance.post('/api/user/login', { username, password });

export const signup = (form) =>
    axiosInstance.post('/api/user/signup', form);

export const logout = () =>
    axiosInstance.post('/logout');
