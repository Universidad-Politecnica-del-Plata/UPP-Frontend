import api from './api';

export const postLogin = (data) => api.post('/auth/login', JSON.stringify(data));