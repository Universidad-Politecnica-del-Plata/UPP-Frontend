import { useState, useEffect } from 'react';
import {styles} from '../styles/upp-style'
import { useNavigate } from 'react-router-dom';
import {iconStyles} from '../styles/icon-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { createAlumno } from '../api/alumnosApi';
import { getTodasCarreras } from '../api/carrerasApi';
import { getTodosPlanesDeEstudio } from '../api/planDeEstudiosApi';
import { getErrorMessage } from '../utils/errorHandler';

const NuevoAlumnoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matricula: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    fechaIngreso: '',
    fechaEgreso: '',
    telefonos: [],
    codigosCarreras: [],
    codigosPlanesDeEstudio: []
  });

  const [carreras, setCarreras] = useState([]);
  const [planesDeEstudio, setPlanesDeEstudio] = useState([]);
  const [planesDeEstudioFiltrados, setPlanesDeEstudioFiltrados] = useState([]);
  const [telefonoInput, setTelefonoInput] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carrerasResponse, planesResponse] = await Promise.all([
          getTodasCarreras(),
          getTodosPlanesDeEstudio()
        ]);
        setCarreras(carrerasResponse.data);
        setPlanesDeEstudio(planesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar datos');
        showNotification('error', errorMessage);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.codigosCarreras.length > 0) {
      const planesFiltrados = planesDeEstudio.filter(plan => 
        formData.codigosCarreras.includes(plan.codigoCarrera)
      );
      setPlanesDeEstudioFiltrados(planesFiltrados);
      
      // Resetear selección de planes que ya no son válidos
      const planesValidosIds = planesFiltrados.map(plan => plan.codigoDePlanDeEstudios);
      const planesSeleccionadosValidos = formData.codigosPlanesDeEstudio.filter(planId => 
        planesValidosIds.includes(planId)
      );
      
      if (planesSeleccionadosValidos.length !== formData.codigosPlanesDeEstudio.length) {
        setFormData(prevState => ({
          ...prevState,
          codigosPlanesDeEstudio: planesSeleccionadosValidos
        }));
      }
    } else {
      setPlanesDeEstudioFiltrados([]);
      setFormData(prevState => ({
        ...prevState,
        codigosPlanesDeEstudio: []
      }));
    }
  }, [formData.codigosCarreras, planesDeEstudio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCarrerasChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosCarreras: selectedOptions
    }));
  };

  const handlePlanesDeEstudioChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prevState => ({
      ...prevState,
      codigosPlanesDeEstudio: selectedOptions
    }));
  };

  const handleAddTelefono = () => {
    if (telefonoInput.trim() && !formData.telefonos.includes(telefonoInput.trim())) {
      setFormData(prevState => ({
        ...prevState,
        telefonos: [...prevState.telefonos, telefonoInput.trim()]
      }));
      setTelefonoInput('');
    }
  };

  const handleRemoveTelefono = (telefono) => {
    setFormData(prevState => ({
      ...prevState,
      telefonos: prevState.telefonos.filter(t => t !== telefono)
    }));
  };

  const token = localStorage.getItem('authToken');
        
  if (!token) {
    showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
    return;
  }

  const handleSubmit = async () => {
    try {
      console.log('Form submitted:', process.env.REACT_APP_API_ENDPOINT + "/alumnos", formData);

      const response = await createAlumno(formData);
      console.log('Response:', response.data);
      showNotification('success', 'Alumno creado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = getErrorMessage(error, 'Error al crear el alumno');
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
        <button style={styles.headerButton} onClick={() => navigate('/GestionAlumnos')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Alumnos</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nuevo Alumno</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Matrícula</label>
            <input
              style={styles.input}
              type="number"
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              placeholder="Ej: 123456"
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
              placeholder="Ej: Juan"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Apellido</label>
            <input
              style={styles.input}
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej: Pérez"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>DNI</label>
            <input
              style={styles.input}
              type="number"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej: 12345678"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan.perez@email.com"
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Dirección</label>
            <input
              style={styles.input}
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Nacimiento</label>
            <input
              style={styles.input}
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Ingreso</label>
            <input
              style={styles.input}
              type="date"
              id="fechaIngreso"
              name="fechaIngreso"
              value={formData.fechaIngreso}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Egreso</label>
            <input
              style={styles.input}
              type="date"
              id="fechaEgreso"
              name="fechaEgreso"
              value={formData.fechaEgreso}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Teléfonos</label>
            <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
              <input
                style={{...styles.input, flex: 1}}
                type="tel"
                value={telefonoInput}
                onChange={(e) => setTelefonoInput(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
              />
              <button
                type="button"
                onClick={handleAddTelefono}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Agregar
              </button>
            </div>
            {formData.telefonos.length > 0 && (
              <div style={{marginTop: '8px'}}>
                {formData.telefonos.map((telefono, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 8px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}>
                    <span>{telefono}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTelefono(telefono)}
                      style={{
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '2px 6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label}>Carreras</label>
            <select
              style={{...styles.select, height: '120px'}}
              multiple
              id="codigosCarreras"
              name="codigosCarreras"
              value={formData.codigosCarreras}
              onChange={handleCarrerasChange}
            >
              {carreras.map(carrera => (
                <option key={carrera.codigoDeCarrera} value={carrera.codigoDeCarrera}>
                  {carrera.codigoDeCarrera} - {carrera.nombre}
                </option>
              ))}
            </select>
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
              {planesDeEstudioFiltrados.length === 0 && formData.codigosCarreras.length === 0 ? (
                <option disabled>Seleccione carreras primero</option>
              ) : planesDeEstudioFiltrados.length === 0 && formData.codigosCarreras.length > 0 ? (
                <option disabled>No hay planes de estudio disponibles para las carreras seleccionadas</option>
              ) : (
                planesDeEstudioFiltrados.map(plan => (
                  <option key={plan.codigoDePlanDeEstudios} value={plan.codigoDePlanDeEstudios}>
                    {plan.codigoDePlanDeEstudios}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/GestionAlumnos')}
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

export default NuevoAlumnoForm;