import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inscripcionStyles } from '../styles/inscripcion-cursos-styles';
import { styles } from '../styles/upp-style';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { useNotification } from '../hooks/useNotification';
import { getMisInscripciones } from '../api/inscripcionesApi';
import { getCurso } from '../api/cursosApi';
import { getMateria } from '../api/materiasApi';
import { getAlumnoActual } from '../api/alumnosApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function MisInscripcionesPage() {
  const [alumno, setAlumno] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [cursos, setCursos] = useState({});
  const [materias, setMaterias] = useState({});
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const inscripcionesPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        const response = await getAlumnoActual();
        setAlumno(response.data);

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
      }
    };

    fetchAlumno();
  }, []);

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        const response = await getMisInscripciones();
        setInscripciones(response.data);

        // Cargar datos de cursos y materias
        const cursosMap = {};
        const materiasMap = {};

        for (const inscripcion of response.data) {
          try {
            const cursoResponse = await getCurso(inscripcion.codigoCurso);
            cursosMap[inscripcion.codigoCurso] = cursoResponse.data;

            const materiaResponse = await getMateria(cursoResponse.data.codigoMateria);
            materiasMap[cursoResponse.data.codigoMateria] = materiaResponse.data;
          } catch (err) {
            console.error(`Error al cargar curso ${inscripcion.codigoCurso}:`, err);
          }
        }

        setCursos(cursosMap);
        setMaterias(materiasMap);
      } catch (err) {
        console.error('Error al cargar inscripciones:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar las inscripciones.');
        showNotification('error', errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

  const filteredInscripciones = inscripciones.filter(inscripcion => {
    const curso = cursos[inscripcion.codigoCurso];
    const materia = curso ? materias[curso.codigoMateria] : null;

    const matchesBusqueda = busqueda === '' ||
      materia?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso?.codigoMateria?.toLowerCase().includes(busqueda.toLowerCase()) ||
      inscripcion.codigoCurso.toLowerCase().includes(busqueda.toLowerCase()) ||
      inscripcion.codigoCuatrimestre.toLowerCase().includes(busqueda.toLowerCase()) ||
      inscripcion.codigoDeInscripcion.toString().includes(busqueda);

    const matchesTipo = filtroTipo === 'todas' ||
      (filtroTipo === 'obligatorias' && materia?.tipo === 'OBLIGATORIA') ||
      (filtroTipo === 'optativas' && materia?.tipo === 'OPTATIVA');

    return matchesBusqueda && matchesTipo;
  });

  const indexOfLastInscripcion = currentPage * inscripcionesPerPage;
  const indexOfFirstInscripcion = indexOfLastInscripcion - inscripcionesPerPage;
  const currentInscripciones = filteredInscripciones.slice(indexOfFirstInscripcion, indexOfLastInscripcion);
  const totalPages = Math.ceil(filteredInscripciones.length / inscripcionesPerPage);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={inscripcionStyles.loadingContainer}>Cargando inscripciones...</div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Mis Inscripciones"
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
            placeholder="Buscar por materia, código de curso, cuatrimestre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {currentInscripciones.length === 0 ? (
        <div style={inscripcionStyles.emptyState}>
          {inscripciones.length === 0
            ? 'No tenés inscripciones aún.'
            : 'No se encontraron inscripciones con los criterios de búsqueda.'}
        </div>
      ) : (
        <>
          {currentInscripciones.map(inscripcion => {
            const curso = cursos[inscripcion.codigoCurso] || {};
            const materia = curso.codigoMateria ? materias[curso.codigoMateria] : {};
            const tipo = materia.tipo || 'OBLIGATORIA';

            return (
              <div key={inscripcion.codigoDeInscripcion} style={inscripcionStyles.cursoCard}>
                <div style={inscripcionStyles.cursoHeader}>
                  <div style={inscripcionStyles.cursoTitleSection}>
                    <h2 style={inscripcionStyles.cursoTitle}>
                      [{curso.codigoMateria || 'N/A'}] {materia.nombre || curso.codigoMateria || 'Materia no disponible'}
                    </h2>
                    <p style={inscripcionStyles.cursoSubtitle}>
                      Curso: {inscripcion.codigoCurso} - Cuatrimestre: {inscripcion.codigoCuatrimestre}
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
                    <strong>Comprobante:</strong> {inscripcion.codigoDeInscripcion}
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Fecha de inscripción:</strong> {inscripcion.fecha}
                  </div>
                  <div style={inscripcionStyles.cursoDetailRow}>
                    <strong>Horario de inscripción:</strong> {inscripcion.horario}
                  </div>
                  {materia.correlativas && materia.correlativas.length > 0 && (
                    <div style={inscripcionStyles.correlativasText}>
                      + Correlativas: {materia.correlativas.join(', ')}
                    </div>
                  )}
                </div>
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
      </div>
    </>
  );
}
