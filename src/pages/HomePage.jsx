import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../contexts/AuthContext';
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

const getMenuItemsByRole = (roles) => {
  const menuItemsByRole = {
    ROLE_ALUMNO: [
      {
        id: 'mi-carrera',
        title: 'Mi Carrera',
        description: 'Consultá la información de tu carrera',
        icon: '🎓',
        route: '/MiCarrera',
      },
      {
        id: 'plan-estudios',
        title: 'Plan de Estudios',
        description: 'Consultá tu malla curricular y materias del plan',
        icon: '📚',
        route: '/MateriasDelPlan',
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
    ],
    ROLE_DOCENTE: [
      {
        id: 'gestion-actas',
        title: 'Gestión de Actas',
        description: 'Administrá actas de finales y cursadas',
        icon: '📋',
        route: '/GestionActas',
      },
      {
        id: 'abrir-acta',
        title: 'Abrir Nueva Acta',
        description: 'Creá una nueva acta para tus cursos',
        icon: '➕',
        route: '/AbrirActa',
      },
    ],
    ROLE_GESTION_ACADEMICA: [
      {
        id: 'gestion-materias',
        title: 'Gestión de Materias',
        description: 'Administrá las materias del sistema',
        icon: '📖',
        route: '/GestionMaterias',
      },
      {
        id: 'gestion-carreras',
        title: 'Gestión de Carreras',
        description: 'Administrá las carreras disponibles',
        icon: '🎓',
        route: '/GestionCarreras',
      },
      {
        id: 'gestion-planes',
        title: 'Planes de Estudio',
        description: 'Administrá los planes de estudio',
        icon: '📚',
        route: '/GestionPlanesDeEstudio',
      },
    ],
    ROLE_GESTION_ESTUDIANTIL: [
      {
        id: 'gestion-alumnos',
        title: 'Gestión de Alumnos',
        description: 'Administrá los alumnos del sistema',
        icon: '👥',
        route: '/GestionAlumnos',
      },
    ],
    ROLE_GESTOR_DE_PLANIFICACION: [
      {
        id: 'gestion-cursos',
        title: 'Gestión de Cursos',
        description: 'Administrá los cursos disponibles',
        icon: '📝',
        route: '/GestionCursos',
      },
      {
        id: 'gestion-cuatrimestres',
        title: 'Gestión de Cuatrimestres',
        description: 'Administrá los períodos académicos',
        icon: '📅',
        route: '/GestionCuatrimestres',
      },
    ],
  };

  const userRole = roles?.find(role => menuItemsByRole[role]);
  return menuItemsByRole[userRole] || [];
};

export default function HomePage() {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = getMenuItemsByRole(user?.roles);
  const isAlumno = user?.roles?.includes('ROLE_ALUMNO');

  useEffect(() => {
    const fetchAlumno = async () => {
      // Solo cargar datos de alumno si el usuario tiene el rol ROLE_ALUMNO
      if (!isAlumno) {
        setLoading(false);
        return;
      }

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

        // Seleccionar el primer plan de estudios por defecto
        if (response.data.codigosPlanesDeEstudio && response.data.codigosPlanesDeEstudio.length > 0) {
          setPlanSeleccionado(response.data.codigosPlanesDeEstudio[0]);
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
  }, [isAlumno]);

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

  const getUserName = () => {
    if (isAlumno && alumno) {
      return alumno.nombre;
    }
    return user?.username || '';
  };

  const getSubtitle = () => {
    if (isAlumno) {
      return 'Accedé a todas las herramientas para gestionar tu vida académica';
    }
    return 'Accedé a las herramientas de gestión del sistema';
  };

  return (
    <div style={homeStyles.pageContainer}>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <Header
        title="Portal Académico"
        showPlanSelector={isAlumno}
        planSeleccionado={planSeleccionado}
        setPlanSeleccionado={setPlanSeleccionado}
      />

      <div style={homeStyles.welcomeSection}>
        <h2 style={homeStyles.welcomeTitle}>
          Bienvenido{getUserName() ? `, ${getUserName()}` : ''}
        </h2>
        <p style={homeStyles.welcomeSubtitle}>
          {getSubtitle()}
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