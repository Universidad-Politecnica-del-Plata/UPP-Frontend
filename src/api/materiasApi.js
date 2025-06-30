import api from './api';

export const getMateria = (codigo) => api.get(`/materias/${codigo}`);
export const createMateria = (data) => api.post('/materias', JSON.stringify(data));
export const updateMateria = (codigo, data) => api.put(`/materias/${codigo}`, JSON.stringify(data));
export const deleteMateria = (codigo) => api.delete(`/materias/${codigo}`);
export const getTodasMaterias = () => api.get('/materias');
