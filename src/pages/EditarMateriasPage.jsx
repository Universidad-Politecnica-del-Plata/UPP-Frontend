import { useState, useEffect } from 'react';
import { styles } from '../styles/upp-style'
import { useNavigate, useParams } from 'react-router-dom';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { iconStyles } from '../styles/icon-styles';
import { getMateria,updateMateria } from '../api/materiasApi';




const EditMateriaForm = () => {
  const navigate = useNavigate();
  const { codigoDeMateria } = useParams(); 
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    codigoDeMateria: '',
    nombre: '',
    contenidos: '',
    creditosQueOtorga: '',
    creditosNecesarios: '',
    tipo: 'OBLIGATORIA',
    codigosCorrelativas: []
  });

  const [newCorrelativa, setNewCorrelativa] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();

  
  useEffect(() => {
    const fetchMateria = async () => {
      try {
        setIsLoading(true);
        const response = await getMateria(codigoDeMateria);
        setFormData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching materia:', error);
        showNotification('error', 'Error al cargar datos de la materia');
        setIsLoading(false);
      }
    };

    if (codigoDeMateria) {
      fetchMateria();
    }
  }, [codigoDeMateria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddCorrelativa = () => {
    if (newCorrelativa.trim() !== '') {
      setFormData(prevState => ({
        ...prevState,
        codigosCorrelativas: [...prevState.codigosCorrelativas, newCorrelativa.trim()]
      }));
      setNewCorrelativa('');
    }
  };

  const handleRemoveCorrelativa = (index) => {
    setFormData(prevState => ({
      ...prevState,
      codigosCorrelativas: prevState.codigosCorrelativas.filter((_, i) => i !== index)
    }));
  };
   const token = localStorage.getItem('authToken');
        
  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', `${process.env.REACT_APP_API_ENDPOINT}/materias/${codigoDeMateria}`, formData);

      const response = await updateMateria(codigoDeMateria,formData);

      console.log('Response:', response.data);
      showNotification('success', 'Materia actualizada exitosamente');
    } catch (error) {
      console.error('Error updating materia:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar la materia';
      showNotification('error', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingIndicator}>Cargando datos de la materia...</div>
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionMaterias')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Materias</span>
        </button>
      </div>

      <h1 style={styles.heading}>Editar Materia</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Código</label>
            <input
              style={{...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
              type="text"
              id="codigoDeMateria"
              name="codigoDeMateria"
              value={formData.codigoDeMateria}
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
            <label style={styles.label}>Correlativas</label>
            <div style={styles.addCorrelativaContainer}>
              <input
                style={styles.addCorrelativaInput}
                type="text"
                value={newCorrelativa}
                onChange={(e) => setNewCorrelativa(e.target.value)}
                placeholder="Ej: MAT100"
              />
              <button 
                style={styles.addCorrelativaButton}
                type="button" 
                onClick={handleAddCorrelativa}
              >
                <span style={iconStyles.plus}>+</span>
              </button>
            </div>
            <div style={styles.correlativasContainer}>
              {formData.codigosCorrelativas.map((correlativa, index) => (
                <div key={index} style={styles.correlativaChip}>
                  <span>{correlativa}</span>
                  <button 
                    style={styles.correlativaRemoveButton}
                    type="button" 
                    onClick={() => handleRemoveCorrelativa(index)}
                  >
                    <span style={iconStyles.x}>×</span>
                  </button>
                </div>
              ))}
            </div>
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
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMateriaForm;