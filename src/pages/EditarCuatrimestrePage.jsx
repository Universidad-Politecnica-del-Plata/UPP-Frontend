import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate, useParams } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getCuatrimestre, updateCuatrimestre } from '../api/cuatrimestresApi';
import { getTodosCursos } from '../api/cursosApi';
import { getErrorMessage } from '../utils/errorHandler';

const EditarCuatrimestrePage = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    codigo: '',
    fechaDeInicioClases: '',
    fechaDeFinClases: '',
    fechaInicioPeriodoDeInscripcion: '',
    fechaFinPeriodoDeInscripcion: '',
    fechaInicioPeriodoIntegradores: '',
    fechaFinPeriodoIntegradores: '',
    codigosCursos: []
  });

  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getTodosCursos();
        setCursosDisponibles(response.data);
      } catch (error) {
        console.error('Error fetching cursos:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar cursos');
        showNotification('error', errorMessage);

        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      }
    };

    fetchCursos();
  }, []);

  useEffect(() => {
    const fetchCuatrimestre = async () => {
      try {
        setIsLoading(true);
        const response = await getCuatrimestre(codigo);
        const data = response.data;

        setFormData({
          codigo: data.codigo,
          fechaDeInicioClases: data.fechaDeInicioClases,
          fechaDeFinClases: data.fechaDeFinClases,
          fechaInicioPeriodoDeInscripcion: data.fechaInicioPeriodoDeInscripcion,
          fechaFinPeriodoDeInscripcion: data.fechaFinPeriodoDeInscripcion,
          fechaInicioPeriodoIntegradores: data.fechaInicioPeriodoIntegradores,
          fechaFinPeriodoIntegradores: data.fechaFinPeriodoIntegradores,
          codigosCursos: data.codigosCursos || []
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching cuatrimestre:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar datos del cuatrimestre');
        showNotification('error', errorMessage);

        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }

        setIsLoading(false);
      }
    };

    if (codigo) {
      fetchCuatrimestre();
    }
  }, [codigo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCursosChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosCursos: selectedOptions
    }));
  };

  const token = localStorage.getItem('authToken');

  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', `${process.env.REACT_APP_API_ENDPOINT}/cuatrimestres/${codigo}`, formData);

      const response = await updateCuatrimestre(codigo, formData);
      console.log('Response:', response.data);
      showNotification('success', 'Cuatrimestre actualizado exitosamente');
    } catch (error) {
      console.error('Error updating cuatrimestre:', error);
      const errorMessage = getErrorMessage(error, 'Error al actualizar el cuatrimestre');
      showNotification('error', errorMessage);

      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingIndicator}>Cargando datos del cuatrimestre...</div>
      </div>
    );
  }

  return (
    <>
      <Header title="Editar Cuatrimestre" />
      <div style={styles.container}>
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />

        <div style={styles.header}>
          <button style={styles.headerButton} onClick={() => navigate('/GestionCuatrimestres')}>
            <span style={iconStyles.arrowLeft}>←</span>
            <span style={styles.headerButtonText}>Volver a Gestión de Cuatrimestres</span>
          </button>
        </div>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>

          <div style={styles.formGroup}>
            <label style={styles.label}>Código del Cuatrimestre</label>
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
            <label style={styles.label}>Fecha de Inicio de Clases</label>
            <input
              style={styles.input}
              type="date"
              id="fechaDeInicioClases"
              name="fechaDeInicioClases"
              value={formData.fechaDeInicioClases}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Fin de Clases</label>
            <input
              style={styles.input}
              type="date"
              id="fechaDeFinClases"
              name="fechaDeFinClases"
              value={formData.fechaDeFinClases}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Inicio Período de Inscripción</label>
            <input
              style={styles.input}
              type="date"
              id="fechaInicioPeriodoDeInscripcion"
              name="fechaInicioPeriodoDeInscripcion"
              value={formData.fechaInicioPeriodoDeInscripcion}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Fin Período de Inscripción</label>
            <input
              style={styles.input}
              type="date"
              id="fechaFinPeriodoDeInscripcion"
              name="fechaFinPeriodoDeInscripcion"
              value={formData.fechaFinPeriodoDeInscripcion}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Inicio Período Integradores</label>
            <input
              style={styles.input}
              type="date"
              id="fechaInicioPeriodoIntegradores"
              name="fechaInicioPeriodoIntegradores"
              value={formData.fechaInicioPeriodoIntegradores}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Fin Período Integradores</label>
            <input
              style={styles.input}
              type="date"
              id="fechaFinPeriodoIntegradores"
              name="fechaFinPeriodoIntegradores"
              value={formData.fechaFinPeriodoIntegradores}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Cursos del Cuatrimestre</label>
            <select
              style={{...styles.select, height: '120px'}}
              multiple
              id="codigosCursos"
              name="codigosCursos"
              value={formData.codigosCursos}
              onChange={handleCursosChange}
            >
              {cursosDisponibles.length === 0 ? (
                <option disabled>No hay cursos disponibles para asignar</option>
              ) : (
                cursosDisponibles.map(curso => (
                  <option key={curso.codigo} value={curso.codigo}>
                    {curso.codigo} - {curso.codigoDeMateria}
                  </option>
                ))
              )}
            </select>
            <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Mantenga presionado Ctrl (o Cmd en Mac) para seleccionar múltiples cursos.
            </small>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionCuatrimestres')}
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
    </>
  );
};

export default EditarCuatrimestrePage;
