import api from './api';

export const getTodosPlanesDeEstudio = () => api.get('/planDeEstudios');
export const createPlanDeEstudios = (data) => api.post('/planDeEstudios', JSON.stringify(data));
export const getPlanDeEstudios = (codigo) => api.get(`/planDeEstudios/${codigo}`);
export const updatePlanDeEstudios = (codigo, data) => api.put(`/planDeEstudios/${codigo}`, JSON.stringify(data));
export const deletePlanDeEstudios = (codigo) => api.delete(`/planDeEstudios/${codigo}`);