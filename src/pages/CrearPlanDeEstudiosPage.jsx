import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { createPlanDeEstudios } from '../api/planDeEstudiosApi';
import { getTodasMaterias } from '../api/materiasApi';

const NuevoPlanDeEstudiosForm = () => {
  const navigate = useNavigate();
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
        const materiasSinPlan = response.data.filter(
          materia => !materia.codigoPlanDeEstudios || materia.codigoPlanDeEstudios === ''
        );
        setMateriasDisponibles(materiasSinPlan);
      } catch (error) {
        console.error('Error fetching materias:', error);
        showNotification('error', 'Error al cargar materias disponibles');
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
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        creditosElectivos: parseInt(formData.creditosElectivos) || 0
      };

      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/planDeEstudios", submitData);

      const response = await createPlanDeEstudios(submitData);
      console.log('Response:', response.data);
      showNotification('success', 'Plan de estudio creado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el plan de estudio';
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionPlanesDeEstudio')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Planes de Estudio</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nuevo Plan de Estudio</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código del Plan</label>
            <input
              style={styles.input}
              type="text"
              id="codigoDePlanDeEstudios"
              name="codigoDePlanDeEstudios"
              value={formData.codigoDePlanDeEstudios}
              onChange={handleChange}
              placeholder="Ej: PLAN2024"
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
              placeholder="Ej: 12"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Entrada en Vigencia</label>
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
            <label style={styles.label}>Fecha Vencimiento</label>
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
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevoPlanDeEstudiosForm;