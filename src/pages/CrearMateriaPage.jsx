import { useState } from 'react';
import {styles} from '../styles/upp-style'
import {notificationStyles} from '../styles/notification-styles'
import {iconStyles} from '../styles/icon-styles'
import axios from 'axios';

const NuevaMateriaForm = () => {
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
  const [notification, setNotification] = useState({
    show: false,
    type: '', 
    message: ''
  });
  
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

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/materias", formData);

      const response = await axios.post(
        process.env.REACT_APP_API_ENDPOINT + "/materias",
        JSON.stringify(formData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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
      
      {/* Notificacion */}
      {notification.show && (
        <div style={notificationStyles.banner(notification.show, notification.type)}>
          <div style={notificationStyles.content}>
            <div style={notificationStyles.icon}>
              {notification.type === 'success' ? (
                <div style={{...iconStyles.icon, ...iconStyles.successIcon}}>
                  <span style={iconStyles.checkmark}>✓</span>
                </div>
              ) : (
                <div style={{...iconStyles.icon, ...iconStyles.alertIcon}}>
                  <span style={iconStyles.x}>x</span>
                </div>
              )}
            </div>
            <div style={notificationStyles.message}>{notification.message}</div>
          </div>
          <button 
            style={notificationStyles.closeButton} 
            onClick={closeNotification}
          >
            <span style={iconStyles.xLarge}>×</span>
          </button>
        </div>
      )}

      <div style={styles.header}>
        <button style={styles.headerButton}>
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