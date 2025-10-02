import api from './api';

export const getCarrera = (codigo) => api.get(`/carreras/${codigo}`);
export const createCarrera = (data) => api.post('/carreras', JSON.stringify(data));
export const updateCarrera = (codigo, data) => api.put(`/carreras/${codigo}`, JSON.stringify(data));
export const deleteCarrera = (codigo) => api.delete(`/carreras/${codigo}`);
export const getTodasCarreras = () => api.get('/carreras');