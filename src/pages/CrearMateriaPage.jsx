import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { createMateria, getTodasMaterias } from '../api/materiasApi';
import { getTodosPlanesDeEstudio } from '../api/planDeEstudiosApi';


const NuevaMateriaForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigoDeMateria: '',
    nombre: '',
    contenidos: '',
    creditosQueOtorga: '',
    creditosNecesarios: '',
    tipo: 'OBLIGATORIA',
    cuatrimestre: '',
    codigoPlanDeEstudios: '',
    codigosCorrelativas: []
  });

  const [planesDeEstudio, setPlanesDeEstudio] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchPlanesDeEstudio = async () => {
      try {
        const response = await getTodosPlanesDeEstudio();
        setPlanesDeEstudio(response.data);
      } catch (error) {
        console.error('Error fetching planes de estudio:', error);
        showNotification('error', 'Error al cargar planes de estudio');
      }
    };

    fetchPlanesDeEstudio();
  }, []);

  useEffect(() => {
    const fetchMateriasPorPlan = async () => {
      if (formData.codigoPlanDeEstudios) {
        try {
          const response = await getTodasMaterias();
          const materiasFiltradas = response.data.filter(
            materia => materia.codigoPlanDeEstudios === formData.codigoPlanDeEstudios
          );
          setMateriasDisponibles(materiasFiltradas);
        } catch (error) {
          console.error('Error fetching materias:', error);
          showNotification('error', 'Error al cargar materias disponibles');
        }
      } else {
        setMateriasDisponibles([]);
      }
    };

    fetchMateriasPorPlan();
  }, [formData.codigoPlanDeEstudios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCorrelativaChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosCorrelativas: selectedOptions
    }));
  };

  const token = localStorage.getItem('authToken');
        
  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/materias", formData);

      const response = await createMateria(formData);
      console.log('Response:', response.data);
      showNotification('success', 'Materia creada exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear la materia';
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionMaterias')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Materias</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nueva Materia</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              style={styles.input}
              type="text"
              id="codigoDeMateria"
              name="codigoDeMateria"
              value={formData.codigoDeMateria}
              onChange={handleChange}
              placeholder="Ej: MAT101"
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
              placeholder="Ej: Álgebra Lineal"
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Contenidos</label>
            <textarea
              style={styles.textarea}
              id="contenidos"
              name="contenidos"
              value={formData.contenidos}
              onChange={handleChange}
              placeholder="Ej: Matrices, Vectores, ..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Créditos Otorga</label>
            <input
              style={styles.input}
              type="number"
              id="creditosQueOtorga"
              name="creditosQueOtorga"
              value={formData.creditosQueOtorga}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Créditos Necesarios</label>
            <input
              style={styles.input}
              type="number"
              id="creditosNecesarios"
              name="creditosNecesarios"
              value={formData.creditosNecesarios}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo</label>
            <select
              style={styles.select}
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="OBLIGATORIA">OBLIGATORIA</option>
              <option value="OPTATIVA">OPTATIVA</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cuatrimestre</label>
            <input
              style={styles.input}
              type="number"
              id="cuatrimestre"
              name="cuatrimestre"
              value={formData.cuatrimestre}
              onChange={handleChange}
              min="1"
              placeholder="Ej: 1"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Plan de Estudios</label>
            <select
              style={styles.select}
              id="codigoPlanDeEstudios"
              name="codigoPlanDeEstudios"
              value={formData.codigoPlanDeEstudios}
              onChange={handleChange}
            >
              <option value="">Seleccionar plan de estudios</option>
              {planesDeEstudio.map(plan => (
                <option key={plan.codigo} value={plan.codigo}>
                  {plan.codigo} - {plan.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Correlativas</label>
            <select
              style={{...styles.select, height: '120px'}}
              multiple
              id="codigosCorrelativas"
              name="codigosCorrelativas"
              value={formData.codigosCorrelativas}
              onChange={handleCorrelativaChange}
            >
              {materiasDisponibles
                .filter(materia => materia.codigoDeMateria !== formData.codigoDeMateria)
                .map(materia => (
                <option key={materia.codigoDeMateria} value={materia.codigoDeMateria}>
                  {materia.codigoDeMateria} - {materia.nombre}
                </option>
              ))}
            </select>
            <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples materias
            </small>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionMaterias')}
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

export default NuevaMateriaForm;