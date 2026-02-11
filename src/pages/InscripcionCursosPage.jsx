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
import { getMateria } from '../api/materiasApi';
import { crearInscripcion } from '../api/inscripcionesApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function InscripcionCursosPage() {
  const [alumno, setAlumno] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const { notification, showNotification, closeNotification } = useNotification();

  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const cursosPerPage = 5;

  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

        // Elegir el primer plan como predeterminado
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

  // Cargar cursos al cambiar el plan de estudios
  useEffect(() => {
    const fetchCursos = async () => {
      if (!planSeleccionado) return;

      try {
        setLoadingMaterias(true);
        const response = await getCursosPorPlanDeEstudios(planSeleccionado);
        setCursos(response.data);

        // Traer datos de las materias de cada curso
        const materiasMap = {};
        for (const curso of response.data) {
          try {
            const materiaResponse = await getMateria(curso.codigoMateria);
            materiasMap[curso.codigoMateria] = materiaResponse.data;
          } catch (err) {
            console.error(`Error al cargar materia ${curso.codigoMateria}:`, err);
            // Si falla, guardamos datos minimos
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

  const filteredCursos = cursos.filter(curso => {
    const materia = materias[curso.codigoMateria] || {};

    const matchesBusqueda = busqueda === '' ||
      materia.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.codigoMateria.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(busqueda.toLowerCase());

    const matchesTipo = filtroTipo === 'todas' ||
      (filtroTipo === 'obligatorias' && materia.tipo === 'OBLIGATORIA') ||
      (filtroTipo === 'optativas' && materia.tipo === 'OPTATIVA');

    return matchesBusqueda && matchesTipo;
  });

  const indexOfLastCurso = currentPage * cursosPerPage;
  const indexOfFirstCurso = indexOfLastCurso - cursosPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstCurso, indexOfLastCurso);
  const totalPages = Math.ceil(filteredCursos.length / cursosPerPage);

  const handleInscribirse = async (codigoCurso) => {
    try {
      const response = await crearInscripcion({ codigoCurso });

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
      <Header
        title="Inscripción a Cursos"
        showPlanSelector={true}
        planSeleccionado={planSeleccionado}
        setPlanSeleccionado={setPlanSeleccionado}
      />
      <div style={styles.container}>
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />

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

      {loadingMaterias ? (
        <div style={inscripcionStyles.loadingContainer}>
          Cargando cursos...
        </div>
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
                    {/* Se deberia mostrar el código del curso y "Prof.",
                     pero no tenemos datos de profesor por ahora (implementacion pendiente) */}
                    <p style={inscripcionStyles.cursoSubtitle}>
                      Curso: {curso.codigo} - Prof.
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
                    <strong>Horario:</strong>
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Modalidad:</strong>
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Aula:</strong>
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
