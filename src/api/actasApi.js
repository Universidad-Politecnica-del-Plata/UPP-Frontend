import api from './api';

export const crearActa = (data) => api.post('/actas', JSON.stringify(data));
export const getTodasActas = () => api.get('/actas');
export const getActa = (numeroCorrelativo) => api.get(`/actas/${numeroCorrelativo}`);
export const getActasPorCurso = (codigoCurso) => api.get(`/actas/curso/${codigoCurso}`);
export const actualizarEstadoActa = (numeroCorrelativo, data) => api.put(`/actas/${numeroCorrelativo}/estado`, JSON.stringify(data));
export const agregarNota = (numeroCorrelativo, data) => api.post(`/actas/${numeroCorrelativo}/notas`, JSON.stringify(data));
export const agregarNotasMasivas = (numeroCorrelativo, data) => api.post(`/actas/${numeroCorrelativo}/notas/masivas`, JSON.stringify(data));
export const getNotasPorActa = (numeroCorrelativo) => api.get(`/actas/${numeroCorrelativo}/notas`);
export const actualizarNota = (notaId, data) => api.put(`/actas/notas/${notaId}`, JSON.stringify(data));
export const eliminarNota = (notaId) => api.delete(`/actas/notas/${notaId}`);
export const getAlumnosInscriptos = (numeroCorrelativo) => api.get(`/actas/${numeroCorrelativo}/alumnos-inscriptos`);
