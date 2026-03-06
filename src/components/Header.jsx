import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlanDeEstudios } from '../contexts/PlanDeEstudiosContext';
import { getAlumnoActual } from '../api/alumnosApi';

const headerStyles = {
  header: {
    backgroundColor: '#1F2937',
    color: 'white',
    padding: '24px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  universityIcon: {
    fontSize: '40px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#D1D5DB',
    margin: '4px 0 0 0',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    textAlign: 'right',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  userRole: {
    fontSize: '12px',
    color: '#D1D5DB',
    margin: '4px 0 0 0',
  },
  logoutButton: {
    background: '#374151',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  homeButton: {
    background: '#374151',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  planSelect: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    minWidth: '200px',
    backgroundColor: 'white',
  },
};

export default function Header({ title, showPlanSelector = false }) {
  const [user, setUser] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const { logout, user: authUser } = useAuth();
  const { planSeleccionado, setPlanSeleccionado } = usePlanDeEstudios();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      // Si el usuario tiene rol de alumno, obtener datos del alumno
      if (authUser?.roles?.includes('ROLE_ALUMNO')) {
        try {
          const response = await getAlumnoActual();
          setAlumno(response.data);
          setUser({
            nombre: response.data.nombre,
            apellido: response.data.apellido,
            rol: 'Estudiante',
          });

          // Si no hay plan seleccionado y el alumno tiene planes, seleccionar el primero
          if (!planSeleccionado && response.data.codigosPlanesDeEstudio && response.data.codigosPlanesDeEstudio.length > 0) {
            setPlanSeleccionado(response.data.codigosPlanesDeEstudio[0]);
          }
        } catch (err) {
          console.error('Error al cargar datos del usuario:', err);
          setUser({
            nombre: authUser.username,
            rol: 'Usuario',
          });
        }
      } else {
        // Para otros roles, usar datos básicos del token
        setUser({
          nombre: authUser?.username || 'Usuario',
          rol: getRoleName(authUser?.roles),
        });
      }
    };

    if (authUser) {
      fetchUser();
    }
  }, [authUser, planSeleccionado, setPlanSeleccionado]);

  const getRoleName = (roles) => {
    if (!roles || roles.length === 0) return 'Usuario';
    if (roles.includes('ROLE_GESTION_ACADEMICA')) return 'Gestión Académica';
    if (roles.includes('ROLE_GESTION_ESTUDIANTIL')) return 'Gestión Estudiantil';
    if (roles.includes('ROLE_GESTOR_DE_PLANIFICACION')) return 'Gestor de Planificación';
    if (roles.includes('ROLE_DOCENTE')) return 'Docente';
    if (roles.includes('ROLE_ALUMNO')) return 'Estudiante';
    return 'Usuario';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/home');
  };

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.headerContent}>
        <div style={headerStyles.headerLeft}>
          <span style={headerStyles.universityIcon}>🏛️</span>
          <div>
            <h1 style={headerStyles.headerTitle}>
              {title || 'Portal Académico'}
            </h1>
            <p style={headerStyles.headerSubtitle}>Universidad Politécnica del Plata</p>
          </div>
        </div>

        <div style={headerStyles.userSection}>
          {showPlanSelector && alumno && alumno.codigosPlanesDeEstudio && alumno.codigosPlanesDeEstudio.length > 0 && (
            <select
              style={headerStyles.planSelect}
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
            >
              {alumno.codigosPlanesDeEstudio.map(codigo => (
                <option key={codigo} value={codigo}>{codigo}</option>
              ))}
            </select>
          )}
          <div style={headerStyles.userInfo}>
            <p style={headerStyles.userName}>
              {user ? (user.apellido ? `${user.nombre} ${user.apellido}` : user.nombre) : 'Usuario'}
            </p>
            <p style={headerStyles.userRole}>{user?.rol || 'Usuario'}</p>
          </div>
          <button
            style={headerStyles.homeButton}
            onClick={handleHome}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
            title="Ir al inicio"
          >
            🏠
          </button>
          <button
            style={headerStyles.logoutButton}
            onClick={handleLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}