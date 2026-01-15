import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inscripcionStyles } from '../styles/inscripcion-cursos-styles';
import { styles } from '../styles/upp-style';
import { confirmationModalStyles } from '../styles/confirm-modal-styles';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { useNotification } from '../hooks/useNotification';
import { getAlumnoActual } from '../api/alumnosApi';
import { getCursosPorPlanDeEstudios } from '../api/cursosApi';
import { getMateria, getTodasMaterias } from '../api/materiasApi';
import { crearInscripcion } from '../api/inscripcionesApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function InscripcionCursosPage() {
  const [alumno, setAlumno] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState({});
  const [materiasDelPlan, setMateriasDelPlan] = useState([]);
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

  // Estado para el modal de confirmación
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estado para acordeones de cuatrimestres
  const [cuatrimestresExpandidos, setCuatrimestresExpandidos] = useState({});

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

  // Cargar materias del plan cuando tab = 'habilitadas'
  useEffect(() => {
    const fetchMateriasDelPlan = async () => {
      if (tabActiva !== 'habilitadas' || !planSeleccionado) return;

      try {
        setLoadingMaterias(true);
        const response = await getTodasMaterias();
        const materiasFiltradas = response.data.filter(
          materia => materia.codigoPlanDeEstudios === planSeleccionado
        );
        setMateriasDelPlan(materiasFiltradas);
      } catch (err) {
        console.error('Error al cargar materias del plan:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar las materias del plan.');
        showNotification('error', errorMessage);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMateriasDelPlan();
  }, [tabActiva, planSeleccionado]);

  // Agrupar materias por cuatrimestre
  const materiasPorCuatrimestre = () => {
    const filtradas = materiasDelPlan.filter(materia => {
      const matchesBusqueda = busqueda === '' ||
        materia.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        materia.codigoDeMateria.toLowerCase().includes(busqueda.toLowerCase());

      const matchesTipo = filtroTipo === 'todas' ||
        (filtroTipo === 'obligatorias' && materia.tipo === 'OBLIGATORIA') ||
        (filtroTipo === 'optativas' && materia.tipo === 'OPTATIVA');

      return matchesBusqueda && matchesTipo;
    });

    const agrupadas = {};
    filtradas.forEach(materia => {
      const cuatrimestre = materia.cuatrimestre || 0;
      if (!agrupadas[cuatrimestre]) {
        agrupadas[cuatrimestre] = [];
      }
      agrupadas[cuatrimestre].push(materia);
    });

    return agrupadas;
  };

  const toggleCuatrimestre = (cuatrimestre) => {
    setCuatrimestresExpandidos(prev => ({
      ...prev,
      [cuatrimestre]: !prev[cuatrimestre]
    }));
  };

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

  const handleInscribirse = async (codigoCurso) => {
    try {
      // Llamar al endpoint de inscripción
      const response = await crearInscripcion({ codigoCurso });

      // Mostrar modal con los datos de la inscripción
      setModalData(response.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error al crear inscripción:', err);
      const errorMessage = getErrorMessage(err, 'Error al inscribirse al curso.');
      showNotification('error', errorMessage);
    }
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
    <>
      <Header title="Inscripción a Cursos" />
      <div style={styles.container}>
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />

        {/* Selector de plan de estudios */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
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
          onClick={() => navigate('/MisInscripciones')}
        >
          Mis Inscripciones
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

      {/* Lista de cursos o materias según tab activa */}
      {loadingMaterias ? (
        <div style={inscripcionStyles.loadingContainer}>
          {tabActiva === 'habilitadas' ? 'Cargando materias...' : 'Cargando cursos...'}
        </div>
      ) : tabActiva === 'habilitadas' ? (
        // Mostrar materias agrupadas por cuatrimestre
        (() => {
          const grouped = materiasPorCuatrimestre();
          const cuatrimestres = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b));

          return cuatrimestres.length === 0 ? (
            <div style={inscripcionStyles.emptyState}>
              No se encontraron materias para el plan de estudios seleccionado.
            </div>
          ) : (
            cuatrimestres.map(cuatrimestre => {
              const materiasDelCuatrimestre = grouped[cuatrimestre];
              const isExpanded = cuatrimestresExpandidos[cuatrimestre];

              return (
                <div key={cuatrimestre} style={inscripcionStyles.cuatrimestreSection}>
                  <div
                    style={inscripcionStyles.cuatrimestreHeader}
                    onClick={() => toggleCuatrimestre(cuatrimestre)}
                  >
                    <div style={inscripcionStyles.cuatrimestreTitle}>
                      <span style={{
                        ...inscripcionStyles.cuatrimestreIcon,
                        ...(isExpanded ? inscripcionStyles.cuatrimestreIconExpanded : {})
                      }}>
                        ▶
                      </span>
                      📚 Cuatrimestre {cuatrimestre}
                      <span style={inscripcionStyles.cuatrimestreCount}>
                        ({materiasDelCuatrimestre.length} {materiasDelCuatrimestre.length === 1 ? 'materia' : 'materias'})
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={inscripcionStyles.cuatrimestreContent}>
                      {materiasDelCuatrimestre.map(materia => {
                        const tipo = materia.tipo || 'OBLIGATORIA';

                        return (
                          <div key={materia.codigoDeMateria} style={inscripcionStyles.cursoCard}>
                            <div style={inscripcionStyles.cursoHeader}>
                              <div style={inscripcionStyles.cursoTitleSection}>
                                <h2 style={inscripcionStyles.cursoTitle}>
                                  [{materia.codigoDeMateria}] {materia.nombre}
                                </h2>
                                <p style={inscripcionStyles.cursoSubtitle}>
                                  {materia.contenidos || 'Sin descripción'}
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

                            {materia.codigosCorrelativas && materia.codigosCorrelativas.length > 0 && (
                              <div style={inscripcionStyles.cursoDetails}>
                                <div style={inscripcionStyles.correlativasText}>
                                  + Correlativas: {materia.codigosCorrelativas.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          );
        })()
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

      {/* Modal de confirmación de inscripción */}
      {showModal && modalData && (
        <div style={confirmationModalStyles.simpleOverlay} onClick={() => setShowModal(false)}>
          <div style={{
            ...confirmationModalStyles.simpleModal,
            width: '400px',
            padding: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#10B981',
              textAlign: 'center'
            }}>
              ✓ Inscripción Exitosa
            </h2>

            <div style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.8'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Código de Inscripción:</strong> {modalData.codigoDeInscripcion}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Fecha:</strong> {modalData.fecha}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Horario:</strong> {modalData.horario}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Código de Curso:</strong> {modalData.codigoCurso}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Código de Cuatrimestre:</strong> {modalData.codigoCuatrimestre}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <button
                style={{
                  ...confirmationModalStyles.simpleConfirmButton,
                  backgroundColor: '#10B981',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
