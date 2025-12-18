import api from './api';

export const crearInscripcion = (inscripcionRequestDTO) => {
  return api.post('/inscripciones', inscripcionRequestDTO);
};

export const getMisInscripciones = () => api.get('/inscripciones/misInscripciones');
