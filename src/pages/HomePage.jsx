import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { useNotification } from '../hooks/useNotification';
import { getAlumnoActual } from '../api/alumnosApi';
import { getErrorMessage } from '../utils/errorHandler';

const homeStyles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  welcomeSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 32px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: 0,
  },
  cardsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 48px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #E5E7EB',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  cardIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
    lineHeight: '1.5',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#6B7280',
  },
};

export default function HomePage() {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { notification, showNotification, closeNotification } = useNotification();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'plan-estudios',
      title: 'Plan de Estudios',
      description: 'Consultá tu malla curricular y materias del plan',
      icon: '📚',
      route: '/InscripcionCursos',
    },
    {
      id: 'historia-academica',
      title: 'Historia Académica',
      description: 'Revisá tus calificaciones y progreso académico',
      icon: '📊',
      route: '/HistoriaAcademica',
    },
    {
      id: 'inscripcion-cursos',
      title: 'Inscripción a Cursos',
      description: 'Inscribite a las materias del próximo período',
      icon: '📝',
      route: '/InscripcionCursos',
    },
    {
      id: 'mis-inscripciones',
      title: 'Mis Inscripciones',
      description: 'Consultá tus inscripciones actuales',
      icon: '✓',
      route: '/MisInscripciones',
    },
  ];

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
          showNotification('error', 'No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
          navigate('/login');
          return;
        }

        const response = await getAlumnoActual();
        setAlumno(response.data);
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

  const handleCardClick = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div style={homeStyles.pageContainer}>
        <div style={homeStyles.loadingContainer}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={homeStyles.pageContainer}>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <Header title="Portal Académico" />

      <div style={homeStyles.welcomeSection}>
        <h2 style={homeStyles.welcomeTitle}>
          Bienvenido{alumno ? `, ${alumno.nombre}` : ''}
        </h2>
        <p style={homeStyles.welcomeSubtitle}>
          Accedé a todas las herramientas para gestionar tu vida académica
        </p>
      </div>

      <div style={homeStyles.cardsGrid}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={{
              ...homeStyles.card,
              ...(hoveredCard === item.id ? homeStyles.cardHover : {}),
            }}
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(item.route)}
          >
            <div style={homeStyles.cardIcon}>{item.icon}</div>
            <h3 style={homeStyles.cardTitle}>{item.title}</h3>
            <p style={homeStyles.cardDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}