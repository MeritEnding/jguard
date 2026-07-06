import axiosInstance from './axiosInstance';

export const fetchQuestions = (page) =>
    axiosInstance.get('/api/questions', { params: { page } });

export const fetchQuestion = (id) =>
    axiosInstance.get(`/api/board/detail/${id}`);

export const createQuestion = (question) =>
    axiosInstance.post('/api/question/create', question);

export const updateQuestion = (id, question) =>
    axiosInstance.put(`/api/question/modify/${id}`, question);

export const deleteQuestion = (id) =>
    axiosInstance.delete(`/api/question/delete/${id}`);

export const createAnswer = (questionId, content) =>
    axiosInstance.post(`/api/answer/create/${questionId}`, { content });
