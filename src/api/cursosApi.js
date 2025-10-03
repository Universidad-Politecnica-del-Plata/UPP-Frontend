import api from './api';

export const getCurso = (codigo) => api.get(`/cursos/${codigo}`);
export const createCurso = (data) => api.post('/cursos', JSON.stringify(data));
export const updateCurso = (codigo, data) => api.put(`/cursos/${codigo}`, JSON.stringify(data));
export const deleteCurso = (codigo) => api.delete(`/cursos/${codigo}`);
export const getTodosCursos = () => api.get('/cursos');
export const getCursosPorMateria = (codigoMateria) => api.get(`/cursos/materia/${codigoMateria}`);
