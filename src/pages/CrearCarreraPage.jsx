import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { createCarrera } from '../api/carrerasApi';
import { getTodosPlanesDeEstudio } from '../api/planDeEstudiosApi';
import { getErrorMessage } from '../utils/errorHandler';

const NuevaCarreraForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigoDeCarrera: '',
    nombre: '',
    titulo: '',
    incumbencias: '',
    codigosPlanesDeEstudio: []
  });

  const [planesDeEstudioDisponibles, setPlanesDeEstudioDisponibles] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchPlanesDeEstudio = async () => {
      try {
        const response = await getTodosPlanesDeEstudio();
        // Filtrar planes de estudio sin carrera asignada
        const planesSinCarrera = response.data.filter(
          plan => !plan.codigoCarrera || plan.codigoCarrera === '' || plan.codigoCarrera === null
        );
        setPlanesDeEstudioDisponibles(planesSinCarrera);
      } catch (error) {
        console.error('Error fetching planes de estudio:', error);
        
        const errorMessage = getErrorMessage(error, 'Error al cargar planes de estudio disponibles');
        showNotification('error', errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      }
    };

    fetchPlanesDeEstudio();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePlanesDeEstudioChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosPlanesDeEstudio: selectedOptions
    }));
  };

  const token = localStorage.getItem('authToken');
        
  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/carreras", formData);

      const response = await createCarrera(formData);
      console.log('Response:', response.data);
      showNotification('success', 'Carrera creada exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      
      const errorMessage = getErrorMessage(error, 'Error al crear la carrera');
      showNotification('error', errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionCarreras')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Carreras</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nueva Carrera</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código de Carrera</label>
            <input
              style={styles.input}
              type="text"
              id="codigoDeCarrera"
              name="codigoDeCarrera"
              value={formData.codigoDeCarrera}
              onChange={handleChange}
              placeholder="Ej: ING001"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Ingeniería en Sistemas"
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Título</label>
            <input
              style={styles.input}
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Ingeniero/a en Sistemas de Información"
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Incumbencias</label>
            <textarea
              style={styles.textarea}
              id="incumbencias"
              name="incumbencias"
              value={formData.incumbencias}
              onChange={handleChange}
              placeholder="Ej: Desarrollo de software, gestión de sistemas, análisis de datos..."
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Planes de Estudio</label>
            <select
              style={{...styles.select, height: '120px'}}
              multiple
              id="codigosPlanesDeEstudio"
              name="codigosPlanesDeEstudio"
              value={formData.codigosPlanesDeEstudio}
              onChange={handlePlanesDeEstudioChange}
            >
              {planesDeEstudioDisponibles.length === 0 ? (
                <option disabled>No hay planes de estudio disponibles para asignar</option>
              ) : (
                planesDeEstudioDisponibles.map(plan => (
                  <option key={plan.codigoDePlanDeEstudios} value={plan.codigoDePlanDeEstudios}>
                    {plan.codigoDePlanDeEstudios}
                  </option>
                ))
              )}
            </select>
            <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Solo se muestran planes de estudio sin carrera asignada
            </small>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionCarreras')}
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

export default NuevaCarreraForm;