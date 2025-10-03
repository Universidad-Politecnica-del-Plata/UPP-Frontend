import { useState, useEffect } from 'react';
import { styles } from '../styles/upp-style'
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { iconStyles } from '../styles/icon-styles';
import { getCurso, updateCurso } from '../api/cursosApi';
import { getTodasMaterias } from '../api/materiasApi';
import { getErrorMessage } from '../utils/errorHandler';

const EditarCursoPage = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        setIsLoading(true);
        const response = await getCurso(codigo);
        setFormData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching curso:', error);

        const errorMessage = getErrorMessage(error, 'Error al cargar datos del curso');
        showNotification('error', errorMessage);

        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }

        setIsLoading(false);
      }
    };

    if (codigo) {
      fetchCurso();
    }
  }, [codigo]);

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
      console.log('Form submitted:', `${process.env.REACT_APP_API_ENDPOINT}/cursos/${codigo}`, formData);

      const response = await updateCurso(codigo, formData);

      console.log('Response:', response.data);
      showNotification('success', 'Curso actualizado exitosamente');
    } catch (error) {
      console.error('Error updating curso:', error);

      const errorMessage = getErrorMessage(error, 'Error al actualizar el curso');
      showNotification('error', errorMessage);

      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingIndicator}>Cargando datos del curso...</div>
      </div>
    );
  }

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

      <h1 style={styles.heading}>Editar Curso</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              style={{...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              disabled
              readOnly
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
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarCursoPage;
