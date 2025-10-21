import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inscripcionStyles } from '../styles/inscripcion-cursos-styles';
import { styles } from '../styles/upp-style';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getAlumnoActual } from '../api/alumnosApi';
import { getCursosPorPlanDeEstudios } from '../api/cursosApi';
import { getMateria } from '../api/materiasApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function InscripcionCursosPage() {
  const [alumno, setAlumno] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const { notification, showNotification, closeNotification } = useNotification();

  const [tabActiva, setTabActiva] = useState('todos'); // 'todos', 'mis-cursos', 'habilitadas'
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const cursosPerPage = 5;

  const navigate = useNavigate();

  // Cargar datos del alumno actual
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
  }, []);

  // Cargar cursos cuando se selecciona un plan de estudios
  useEffect(() => {
    const fetchCursos = async () => {
      if (!planSeleccionado) return;

      try {
        setLoadingMaterias(true);
        const response = await getCursosPorPlanDeEstudios(planSeleccionado);
        setCursos(response.data);

        // Cargar información de las materias de cada curso
        const materiasMap = {};
        for (const curso of response.data) {
          try {
            const materiaResponse = await getMateria(curso.codigoMateria);
            materiasMap[curso.codigoMateria] = materiaResponse.data;
          } catch (err) {
            console.error(`Error al cargar materia ${curso.codigoMateria}:`, err);
            // Si falla, guardamos datos básicos
            materiasMap[curso.codigoMateria] = {
              codigo: curso.codigoMateria,
              nombre: curso.codigoMateria,
              creditos: 0,
              correlativas: []
            };
          }
        }
        setMaterias(materiasMap);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar los cursos.');
        showNotification('error', errorMessage);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchCursos();
  }, [planSeleccionado]);

  // Filtrar cursos
  const filteredCursos = cursos.filter(curso => {
    const materia = materias[curso.codigoMateria] || {};

    // Filtro por búsqueda
    const matchesBusqueda = busqueda === '' ||
      materia.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.codigoMateria.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(busqueda.toLowerCase());

    // Filtro por tipo (obligatoria/optativa)
    const matchesTipo = filtroTipo === 'todas' ||
      (filtroTipo === 'obligatorias' && materia.tipo === 'OBLIGATORIA') ||
      (filtroTipo === 'optativas' && materia.tipo === 'OPTATIVA');

    return matchesBusqueda && matchesTipo;
  });

  // Paginación
  const indexOfLastCurso = currentPage * cursosPerPage;
  const indexOfFirstCurso = indexOfLastCurso - cursosPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstCurso, indexOfLastCurso);
  const totalPages = Math.ceil(filteredCursos.length / cursosPerPage);

  const handleInscribirse = (codigoCurso) => {
    // TODO: Implementar lógica de inscripción cuando el backend esté listo
    showNotification('info', `Funcionalidad de inscripción pendiente para curso ${codigoCurso}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={inscripcionStyles.loadingContainer}>Cargando datos del alumno...</div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div style={styles.container}>
        <div style={inscripcionStyles.emptyState}>No se pudieron cargar los datos del alumno.</div>
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

      {/* Header con fondo azul */}
      <div style={inscripcionStyles.pageHeader}>
        <div style={inscripcionStyles.headerLeft}>
          <button
            style={inscripcionStyles.homeButton}
            onClick={() => navigate('/')}
            title="Ir al inicio"
          >
            🏠
          </button>
          <h1 style={inscripcionStyles.pageTitle}>
            {alumno.nombre} {alumno.apellido} - Inscripción a Cursos
          </h1>
        </div>
        <select
          style={inscripcionStyles.carreraSelect}
          value={planSeleccionado}
          onChange={(e) => setPlanSeleccionado(e.target.value)}
        >
          {alumno.codigosPlanesDeEstudio && alumno.codigosPlanesDeEstudio.map(codigo => (
            <option key={codigo} value={codigo}>{codigo}</option>
          ))}
        </select>
      </div>

      {/* Tabs de navegación */}
      <div style={inscripcionStyles.tabsContainer}>
        <button
          style={{
            ...inscripcionStyles.tab,
            ...(tabActiva === 'todos' ? inscripcionStyles.tabActive : {})
          }}
          onClick={() => setTabActiva('todos')}
        >
          Todos los Cursos
        </button>
        <button
          style={{
            ...inscripcionStyles.tab,
            ...(tabActiva === 'mis-cursos' ? inscripcionStyles.tabActive : {})
          }}
          onClick={() => setTabActiva('mis-cursos')}
        >
          Mis Cursos
        </button>
        <button
          style={{
            ...inscripcionStyles.tab,
            ...inscripcionStyles.tabLast,
            ...(tabActiva === 'habilitadas' ? inscripcionStyles.tabActive : {})
          }}
          onClick={() => setTabActiva('habilitadas')}
        >
          Materias del Plan
        </button>
      </div>

      {/* Filtros */}
      <div style={inscripcionStyles.filtersRow}>
        <div style={inscripcionStyles.filterGroup}>
          <label style={inscripcionStyles.filterLabel}>Modalidad</label>
          <select
            style={inscripcionStyles.filterSelect}
            value={filtroModalidad}
            onChange={(e) => setFiltroModalidad(e.target.value)}
          >
            <option value="todas">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>

        <div style={inscripcionStyles.filterGroup}>
          <label style={inscripcionStyles.filterLabel}>Tipo</label>
          <select
            style={inscripcionStyles.filterSelect}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="obligatorias">Obligatorias</option>
            <option value="optativas">Optativas</option>
          </select>
        </div>

        <div style={inscripcionStyles.searchGroup}>
          <label style={inscripcionStyles.filterLabel}>Buscar</label>
          <input
            type="text"
            style={inscripcionStyles.searchInput}
            placeholder="Buscar por nombre de materia, código de materia"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de cursos */}
      {loadingMaterias ? (
        <div style={inscripcionStyles.loadingContainer}>Cargando cursos...</div>
      ) : currentCursos.length === 0 ? (
        <div style={inscripcionStyles.emptyState}>
          No se encontraron cursos para el plan de estudios seleccionado.
        </div>
      ) : (
        <>
          {currentCursos.map(curso => {
            const materia = materias[curso.codigoMateria] || {};
            const tipo = materia.tipo || 'OBLIGATORIA';

            return (
              <div key={curso.codigo} style={inscripcionStyles.cursoCard}>
                <div style={inscripcionStyles.cursoHeader}>
                  <div style={inscripcionStyles.cursoTitleSection}>
                    <h2 style={inscripcionStyles.cursoTitle}>
                      [{curso.codigoMateria}] {materia.nombre || curso.codigoMateria}
                    </h2>
                    <p style={inscripcionStyles.cursoSubtitle}>
                      Curso: {curso.codigo} - Prof. {/* Profesor vacío por ahora */}
                    </p>
                  </div>
                  <div style={inscripcionStyles.cursoRightSection}>
                    <span style={inscripcionStyles.creditosBadge}>
                      Créditos: {materia.creditosQueOtorga || 0}
                    </span>
                    <span
                      style={{
                        ...inscripcionStyles.tipoBadge,
                        ...(tipo === 'OBLIGATORIA'
                          ? inscripcionStyles.tipoBadgeObligatorio
                          : inscripcionStyles.tipoBadgeOptativo)
                      }}
                    >
                      {tipo === 'OBLIGATORIA' ? 'Obligatoria' : 'Optativa'}
                    </span>
                  </div>
                </div>

                <div style={inscripcionStyles.cursoDetails}>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Horario:</strong> {/* Horario vacío */}
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Modalidad:</strong> {/* Modalidad vacía */}
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Aula:</strong> {/* Aula vacía */}
                  </div>
                  {materia.correlativas && materia.correlativas.length > 0 && (
                    <div style={inscripcionStyles.correlativasText}>
                      + Correlativas: {materia.correlativas.join(', ')}
                    </div>
                  )}
                </div>

                <button
                  style={inscripcionStyles.inscribirseButton}
                  onClick={() => handleInscribirse(curso.codigo)}
                >
                  Inscribirse
                </button>
              </div>
            );
          })}

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={inscripcionStyles.paginationContainer}>
              <button
                style={{
                  ...inscripcionStyles.paginationButton,
                  ...(currentPage === 1 ? inscripcionStyles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹‹
              </button>

              <button
                style={{
                  ...inscripcionStyles.paginationButton,
                  ...(currentPage === 1 ? inscripcionStyles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              <button style={{...inscripcionStyles.paginationButton, background: '#3B82F6', color: 'white'}}>
                {currentPage}
              </button>

              <button style={inscripcionStyles.paginationButton}>
                {currentPage < totalPages ? currentPage + 1 : ''}
              </button>

              <button
                style={{
                  ...inscripcionStyles.paginationButton,
                  ...(currentPage === totalPages ? inscripcionStyles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>

              <button
                style={{
                  ...inscripcionStyles.paginationButton,
                  ...(currentPage === totalPages ? inscripcionStyles.paginationButtonDisabled : {})
                }}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ››
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
