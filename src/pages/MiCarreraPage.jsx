import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getAlumnoActual } from '../api/alumnosApi';
import { getCarrera } from '../api/carrerasApi';
import { getErrorMessage } from '../utils/errorHandler';

const pageStyles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  selectorContainer: {
    marginBottom: '24px',
  },
  carreraSelect: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 24px 0',
  },
  fieldGroup: {
    marginBottom: '24px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  },
  value: {
    fontSize: '16px',
    color: '#111827',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
  },
  planList: {
    fontSize: '16px',
    color: '#111827',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
    listStyle: 'none',
    margin: 0,
  },
  planItem: {
    padding: '4px 0',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#6B7280',
  },
  backButton: {
    background: '#1F2937',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '24px',
  },
};

export default function MiCarreraPage() {
  const [alumno, setAlumno] = useState(null);
  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        setLoading(true);

        const alumnoResponse = await getAlumnoActual();
        setAlumno(alumnoResponse.data);

        if (!alumnoResponse.data.codigosCarreras || alumnoResponse.data.codigosCarreras.length === 0) {
          showNotification('error', 'No se encontraron carreras asociadas a tu cuenta');
          return;
        }

        // Seleccionar la primera carrera por defecto
        setCarreraSeleccionada(alumnoResponse.data.codigosCarreras[0]);

        // Seleccionar el primer plan por defecto
        if (alumnoResponse.data.codigosPlanesDeEstudio && alumnoResponse.data.codigosPlanesDeEstudio.length > 0) {
          setPlanSeleccionado(alumnoResponse.data.codigosPlanesDeEstudio[0]);
        }
      } catch (err) {
        console.error('Error al cargar datos del alumno:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar los datos del alumno.');
        showNotification('error', errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlumno();
  }, []);

  useEffect(() => {
    const fetchCarrera = async () => {
      if (!carreraSeleccionada) return;

      try {
        const carreraResponse = await getCarrera(carreraSeleccionada);
        setCarrera(carreraResponse.data);
      } catch (err) {
        console.error('Error al cargar datos de la carrera:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar los datos de la carrera.');
        showNotification('error', errorMessage);
      }
    };

    fetchCarrera();
  }, [carreraSeleccionada]);

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div style={pageStyles.pageContainer}>
        <Header
          title="Mi Carrera"
          showPlanSelector={true}
          planSeleccionado={planSeleccionado}
          setPlanSeleccionado={setPlanSeleccionado}
        />
        <div style={pageStyles.loadingContainer}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={pageStyles.pageContainer}>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <Header
        title="Mi Carrera"
        showPlanSelector={true}
        planSeleccionado={planSeleccionado}
        setPlanSeleccionado={setPlanSeleccionado}
      />

      <div style={pageStyles.contentContainer}>
        {alumno && alumno.codigosCarreras && alumno.codigosCarreras.length > 1 && (
          <div style={pageStyles.selectorContainer}>
            <label style={pageStyles.label}>Seleccioná una carrera</label>
            <select
              style={pageStyles.carreraSelect}
              value={carreraSeleccionada}
              onChange={(e) => setCarreraSeleccionada(e.target.value)}
            >
              {alumno.codigosCarreras.map(codigo => (
                <option key={codigo} value={codigo}>{codigo}</option>
              ))}
            </select>
          </div>
        )}

        {carrera ? (
          <div style={pageStyles.card}>
            <h2 style={pageStyles.title}>{carrera.nombre}</h2>

            <div style={pageStyles.fieldGroup}>
              <label style={pageStyles.label}>Código de Carrera</label>
              <div style={pageStyles.value}>{carrera.codigoDeCarrera}</div>
            </div>

            <div style={pageStyles.fieldGroup}>
              <label style={pageStyles.label}>Título</label>
              <div style={pageStyles.value}>{carrera.titulo}</div>
            </div>

            <div style={pageStyles.fieldGroup}>
              <label style={pageStyles.label}>Incumbencias</label>
              <div style={pageStyles.value}>{carrera.incumbencias}</div>
            </div>

            {carrera.codigosPlanesDeEstudio && carrera.codigosPlanesDeEstudio.length > 0 && (
              <div style={pageStyles.fieldGroup}>
                <label style={pageStyles.label}>Planes de Estudio</label>
                <ul style={pageStyles.planList}>
                  {carrera.codigosPlanesDeEstudio.map((codigo, index) => (
                    <li key={index} style={pageStyles.planItem}>• {codigo}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              style={pageStyles.backButton}
              onClick={handleBack}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1F2937'}
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div style={pageStyles.card}>
            <p>No se encontraron datos de la carrera.</p>
          </div>
        )}
      </div>
    </div>
  );
}
