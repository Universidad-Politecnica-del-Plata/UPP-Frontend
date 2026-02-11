import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inscripcionStyles } from '../styles/inscripcion-cursos-styles';
import { styles } from '../styles/upp-style';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { useNotification } from '../hooks/useNotification';
import { getAlumnoActual } from '../api/alumnosApi';
import { getTodasMaterias } from '../api/materiasApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function MateriasDelPlanPage() {
  const [alumno, setAlumno] = useState(null);
  const [materiasDelPlan, setMateriasDelPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const { notification, showNotification, closeNotification } = useNotification();

  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const [cuatrimestresExpandidos, setCuatrimestresExpandidos] = useState({});

  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchMateriasDelPlan = async () => {
      if (!planSeleccionado) return;

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
  }, [planSeleccionado]);

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
        title="Materias del Plan"
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
            Cargando materias...
          </div>
        ) : (() => {
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
        })()}
      </div>
    </>
  );
}
