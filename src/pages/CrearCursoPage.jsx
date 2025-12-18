import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { createCurso } from '../api/cursosApi';
import { getTodasMaterias } from '../api/materiasApi';
import { getErrorMessage } from '../utils/errorHandler';

const CrearCursoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo: '',
    maximoDeAlumnos: '',
    codigoMateria: ''
  });

  const [materias, setMaterias] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await getTodasMaterias();
        setMaterias(response.data);
      } catch (error) {
        console.error('Error fetching materias:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar materias');
        showNotification('error', errorMessage);
      }
    };

    fetchMaterias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const token = localStorage.getItem('authToken');

  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/cursos", formData);

      const response = await createCurso(formData);
      console.log('Response:', response.data);
      showNotification('success', 'Curso creado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = getErrorMessage(error, 'Error al crear el curso');
      showNotification('error', errorMessage);
    }
  };

  return (
    <div style={styles.container}>

        <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />


      <div style={styles.header}>
        <button style={styles.headerButton} onClick={() => navigate('/GestionCursos')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Cursos</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nuevo Curso</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              style={styles.input}
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: CUR001"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Máximo de Alumnos</label>
            <input
              style={styles.input}
              type="number"
              id="maximoDeAlumnos"
              name="maximoDeAlumnos"
              value={formData.maximoDeAlumnos}
              onChange={handleChange}
              min="1"
              placeholder="Ej: 30"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Materia</label>
            <select
              style={styles.select}
              id="codigoMateria"
              name="codigoMateria"
              value={formData.codigoMateria}
              onChange={handleChange}
            >
              <option value="">Seleccionar materia...</option>
              {materias.map(materia => (
                <option key={materia.codigoDeMateria} value={materia.codigoDeMateria}>
                  {materia.codigoDeMateria} - {materia.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionCursos')}
            style={styles.cancelButton}
            type="button"
          >
            Cancelar
          </button>
          <button
            style={styles.saveButton}
            type="button"
            onClick={handleSubmit}
          >
            <span style={styles.saveButtonIcon}>
              <span style={iconStyles.save}>💾</span>
            </span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearCursoPage;
