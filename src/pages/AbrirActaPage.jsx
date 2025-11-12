import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { crearActa } from '../api/actasApi';
import { getTodosCursos } from '../api/cursosApi';
import { getErrorMessage } from '../utils/errorHandler';

const AbrirActaPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoDeActa: '',
    estado: 'ABIERTA',
    codigoCurso: ''
  });

  const [cursos, setCursos] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getTodosCursos();
        setCursos(response.data);
      } catch (error) {
        console.error('Error fetching cursos:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar cursos');
        showNotification('error', errorMessage);
      }
    };

    fetchCursos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!formData.tipoDeActa) {
      showNotification('error', 'El tipo de acta es obligatorio');
      return;
    }
    if (!formData.codigoCurso) {
      showNotification('error', 'El código del curso es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        return;
      }

      console.log('Form submitted:', formData);
      const response = await crearActa(formData);
      console.log('Response:', response.data);
      showNotification('success', 'Acta creada exitosamente');

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/GestionActas');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = getErrorMessage(error, 'Error al crear el acta');
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionActas')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Actas</span>
        </button>
      </div>

      <h1 style={styles.heading}>Abrir Nueva Acta</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Acta *</label>
            <select
              style={styles.select}
              id="tipoDeActa"
              name="tipoDeActa"
              value={formData.tipoDeActa}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo...</option>
              <option value="FINAL">Final</option>
              <option value="CURSADA">Cursada</option>
            </select>
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Curso *</label>
            <select
              style={styles.select}
              id="codigoCurso"
              name="codigoCurso"
              value={formData.codigoCurso}
              onChange={handleChange}
            >
              <option value="">Seleccionar curso...</option>
              {cursos.map(curso => (
                <option key={curso.codigo} value={curso.codigo}>
                  {curso.codigo} - {curso.codigoMateria}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionActas')}
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
            Abrir Acta
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbrirActaPage;
