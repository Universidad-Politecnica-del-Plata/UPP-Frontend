import { useState, useEffect } from 'react';
import { styles } from '../styles/upp-style'
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { iconStyles } from '../styles/icon-styles';
import { getCarrera, updateCarrera } from '../api/carrerasApi';
import { getTodosPlanesDeEstudio } from '../api/planDeEstudiosApi';
import { getErrorMessage } from '../utils/errorHandler';

const EditCarreraForm = () => {
  const navigate = useNavigate();
  const { codigo } = useParams(); 
  const [isLoading, setIsLoading] = useState(true);
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
        // Filtrar planes sin carrera asignada o de la carrera actual
        const planesValidos = response.data.filter(
          plan => !plan.codigoCarrera || 
                  plan.codigoCarrera === '' || 
                  plan.codigoCarrera === codigo
        );
        setPlanesDeEstudioDisponibles(planesValidos);
      } catch (error) {
        console.error('Error fetching planes de estudio:', error);
        
        const errorMessage = getErrorMessage(error, 'Error al cargar planes de estudio disponibles');
        showNotification('error', errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      }
    };

    if (codigo) {
      fetchPlanesDeEstudio();
    }
    // eslint-disable-next-line
  }, [codigo]);

  useEffect(() => {
    const fetchCarrera = async () => {
      try {
        setIsLoading(true);
        const response = await getCarrera(codigo);
        const data = response.data;
        
        setFormData({
          codigoDeCarrera: data.codigoDeCarrera,
          nombre: data.nombre,
          titulo: data.titulo,
          incumbencias: data.incumbencias,
          codigosPlanesDeEstudio: data.codigosPlanesDeEstudio || []
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching carrera:', error);
        
        const errorMessage = getErrorMessage(error, 'Error al cargar datos de la carrera');
        showNotification('error', errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
        
        setIsLoading(false);
      }
    };

    if (codigo) {
      fetchCarrera();
    }
    // eslint-disable-next-line
  }, [codigo]);

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
      console.log('Form submitted:', `${process.env.REACT_APP_API_ENDPOINT}/carreras/${codigo}`, formData);

      const response = await updateCarrera(codigo, formData);

      console.log('Response:', response.data);
      showNotification('success', 'Carrera actualizada exitosamente');
    } catch (error) {
      console.error('Error updating carrera:', error);
      
      const errorMessage = getErrorMessage(error, 'Error al actualizar la carrera');
      showNotification('error', errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingIndicator}>Cargando datos de la carrera...</div>
      </div>
    );
  }

  return (
    <>
      <Header title="Editar Carrera" />
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

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código de Carrera</label>
            <input
              style={{...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
              type="text"
              id="codigoDeCarrera"
              name="codigoDeCarrera"
              value={formData.codigoDeCarrera}
              disabled
              readOnly
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
              {planesDeEstudioDisponibles.map(plan => (
                <option key={plan.codigoDePlanDeEstudios} value={plan.codigoDePlanDeEstudios}>
                  {plan.codigoDePlanDeEstudios}
                </option>
              ))}
            </select>
            <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Solo se muestran planes sin carrera asignada o de la carrera actual.
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
            Guardar Cambios
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default EditCarreraForm;