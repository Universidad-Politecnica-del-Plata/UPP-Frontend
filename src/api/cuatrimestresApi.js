import api from './api';

export const getCuatrimestre = (codigo) => api.get(`/cuatrimestres/${codigo}`);
export const createCuatrimestre = (data) => api.post('/cuatrimestres', JSON.stringify(data));
export const updateCuatrimestre = (codigo, data) => api.put(`/cuatrimestres/${codigo}`, JSON.stringify(data));
export const deleteCuatrimestre = (codigo) => api.delete(`/cuatrimestres/${codigo}`);
export const getTodosCuatrimestres = () => api.get('/cuatrimestres');
