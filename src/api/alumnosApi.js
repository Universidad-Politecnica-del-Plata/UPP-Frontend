import api from './api';

export const getAlumno = (matricula) => api.get(`/alumnos/${matricula}`);
export const createAlumno = (data) => api.post('/alumnos', JSON.stringify(data));
export const updateAlumno = (matricula, data) => api.put(`/alumnos/${matricula}`, JSON.stringify(data));
export const deleteAlumno = (matricula) => api.delete(`/alumnos/${matricula}`);
export const getTodosAlumnos = () => api.get('/alumnos');
export const getTodosLosAlumnosActivos = () => api.get('/alumnos/activos');