import { useState, useEffect } from 'react';
import { styles } from '../styles/upp-style'
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { iconStyles } from '../styles/icon-styles';
import { getPlanDeEstudios, updatePlanDeEstudios } from '../api/planDeEstudiosApi';
import { getTodasMaterias } from '../api/materiasApi';
import { getErrorMessage } from '../utils/errorHandler';

const EditPlanDeEstudiosForm = () => {
  const navigate = useNavigate();
  const { codigo } = useParams(); 
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    codigoDePlanDeEstudios: '',
    creditosElectivos: '',
    fechaEntradaEnVigencia: '',
    fechaVencimiento: '',
    codigosMaterias: []
  });

  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await getTodasMaterias();
        // Filtrar materias sin plan asignado o del plan actual
        const materiasValidas = response.data.filter(
          materia => !materia.codigoPlanDeEstudios || 
                    materia.codigoPlanDeEstudios === '' || 
                    materia.codigoPlanDeEstudios === codigo
        );
        setMateriasDisponibles(materiasValidas);
      } catch (error) {
        console.error('Error fetching materias:', error);
        
        const errorMessage = getErrorMessage(error, 'Error al cargar materias disponibles');
        showNotification('error', errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      }
    };

    if (codigo) {
      fetchMaterias();
    }
  }, [codigo]);

  useEffect(() => {
    const fetchPlanDeEstudios = async () => {
      try {
        setIsLoading(true);
        const response = await getPlanDeEstudios(codigo);
        const data = response.data;
        
        setFormData({
          codigoDePlanDeEstudios: data.codigoDePlanDeEstudios,
          creditosElectivos: data.creditosElectivos,
          fechaEntradaEnVigencia: data.fechaEntradaEnVigencia ? data.fechaEntradaEnVigencia.split('T')[0] : '',
          fechaVencimiento: data.fechaVencimiento ? data.fechaVencimiento.split('T')[0] : '',
          codigosMaterias: data.codigosMaterias || []
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching plan de estudios:', error);
        
        const errorMessage = getErrorMessage(error, 'Error al cargar datos del plan de estudios');
        showNotification('error', errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
        
        setIsLoading(false);
      }
    };

    if (codigo) {
      fetchPlanDeEstudios();
    }
  }, [codigo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMateriasChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosMaterias: selectedOptions
    }));
  };

  const token = localStorage.getItem('authToken');
        
  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', `${process.env.REACT_APP_API_ENDPOINT}/planDeEstudios/${codigo}`, formData);

      const response = await updatePlanDeEstudios(codigo, formData);

      console.log('Response:', response.data);
      showNotification('success', 'Plan de estudios actualizado exitosamente');
    } catch (error) {
      console.error('Error updating plan de estudios:', error);
      
      const errorMessage = getErrorMessage(error, 'Error al actualizar el plan de estudios');
      showNotification('error', errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingIndicator}>Cargando datos del plan de estudios...</div>
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionPlanesDeEstudio')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Planes de Estudio</span>
        </button>
      </div>

      <h1 style={styles.heading}>Editar Plan de Estudios</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              style={{...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
              type="text"
              id="codigoDePlanDeEstudios"
              name="codigoDePlanDeEstudios"
              value={formData.codigoDePlanDeEstudios}
              disabled
              readOnly
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Créditos Electivos</label>
            <input
              style={styles.input}
              type="number"
              id="creditosElectivos"
              name="creditosElectivos"
              value={formData.creditosElectivos}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Entrada en Vigencia</label>
            <input
              style={styles.input}
              type="date"
              id="fechaEntradaEnVigencia"
              name="fechaEntradaEnVigencia"
              value={formData.fechaEntradaEnVigencia}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Vencimiento</label>
            <input
              style={styles.input}
              type="date"
              id="fechaVencimiento"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Materias del Plan</label>
            <select
              style={{...styles.select, height: '120px'}}
              multiple
              id="codigosMaterias"
              name="codigosMaterias"
              value={formData.codigosMaterias}
              onChange={handleMateriasChange}
            >
              {materiasDisponibles.map(materia => (
                <option key={materia.codigoDeMateria} value={materia.codigoDeMateria}>
                  {materia.codigoDeMateria} - {materia.nombre}
                </option>
              ))}
            </select>
            <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Solo se muestran materias sin plan asignado o del plan actual.
            </small>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionPlanesDeEstudio')}
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

export default EditPlanDeEstudiosForm;