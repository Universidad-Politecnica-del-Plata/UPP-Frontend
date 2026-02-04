import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getMiHistoriaAcademica, getAlumnoActual } from '../api/alumnosApi';
import { getPlanDeEstudios } from '../api/planDeEstudiosApi';
import { getErrorMessage } from '../utils/errorHandler';

const pageStyles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 24px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statBox: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
  },
  tableTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 20px 0',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderBottom: '2px solid #E5E7EB',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #E5E7EB',
    fontSize: '14px',
    color: '#111827',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6B7280',
    fontSize: '16px',
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

export default function HistoriaAcademicaPage() {
  const [historia, setHistoria] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const alumnoResponse = await getAlumnoActual();
        if (alumnoResponse.data.codigosPlanesDeEstudio && alumnoResponse.data.codigosPlanesDeEstudio.length > 0) {
          setPlanSeleccionado(alumnoResponse.data.codigosPlanesDeEstudio[0]);
        }

        const historiaResponse = await getMiHistoriaAcademica();
        setHistoria(historiaResponse.data);
      } catch (err) {
        console.error('Error al cargar historia académica:', err);
        const errorMessage = getErrorMessage(err, 'Error al cargar la historia académica.');
        showNotification('error', errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPlanInfo = async () => {
      if (!planSeleccionado) return;

      try {
        const planResponse = await getPlanDeEstudios(planSeleccionado);
        setPlanInfo(planResponse.data);
      } catch (err) {
        console.error('Error al cargar información del plan:', err);
      }
    };

    fetchPlanInfo();
  }, [planSeleccionado]);

  const formatFecha = (fechaString) => {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-AR');
  };

  const calcularPromedio = () => {
    if (!historia || !historia.materiasAprobadas || historia.materiasAprobadas.length === 0) {
      return 0;
    }
    const suma = historia.materiasAprobadas.reduce((acc, materia) => acc + materia.nota, 0);
    return (suma / historia.materiasAprobadas.length).toFixed(2);
  };

  const getTotalCreditos = () => {
    if (!planInfo) return '?';
    return planInfo.creditosObligatorios + planInfo.creditosElectivos;
  };

  const getTotalMaterias = () => {
    if (!planInfo || !planInfo.codigosMaterias) return '?';
    return planInfo.codigosMaterias.length;
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div style={pageStyles.pageContainer}>
        <Header
          title="Historia Académica"
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
        title="Historia Académica"
        showPlanSelector={true}
        planSeleccionado={planSeleccionado}
        setPlanSeleccionado={setPlanSeleccionado}
      />

      <div style={pageStyles.contentContainer}>
        {historia ? (
          <>
            <div style={pageStyles.headerCard}>
              <h2 style={pageStyles.headerTitle}>{historia.nombreCompleto}</h2>
              <div style={pageStyles.statsGrid}>
                <div style={pageStyles.statBox}>
                  <div style={pageStyles.statLabel}>Matrícula</div>
                  <div style={pageStyles.statValue}>{historia.matricula}</div>
                </div>
                <div style={pageStyles.statBox}>
                  <div style={pageStyles.statLabel}>Créditos Acumulados</div>
                  <div style={pageStyles.statValue}>
                    {historia.creditosAcumulados} / {getTotalCreditos()}
                  </div>
                </div>
                <div style={pageStyles.statBox}>
                  <div style={pageStyles.statLabel}>Promedio</div>
                  <div style={pageStyles.statValue}>{calcularPromedio()}</div>
                </div>
                <div style={pageStyles.statBox}>
                  <div style={pageStyles.statLabel}>Materias Aprobadas</div>
                  <div style={pageStyles.statValue}>
                    {historia.materiasAprobadas?.length || 0} / {getTotalMaterias()}
                  </div>
                </div>
              </div>
            </div>

            <div style={pageStyles.tableCard}>
              <h3 style={pageStyles.tableTitle}>Materias Aprobadas</h3>
              {historia.materiasAprobadas && historia.materiasAprobadas.length > 0 ? (
                <div style={pageStyles.tableContainer}>
                  <table style={pageStyles.table}>
                    <thead>
                      <tr>
                        <th style={pageStyles.th}>Código</th>
                        <th style={pageStyles.th}>Materia</th>
                        <th style={pageStyles.th}>Nota</th>
                        <th style={pageStyles.th}>Créditos</th>
                        <th style={pageStyles.th}>Fecha Aprobación</th>
                        <th style={pageStyles.th}>Nº Acta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historia.materiasAprobadas.map((materia, index) => (
                        <tr key={index}>
                          <td style={pageStyles.td}>{materia.codigoMateria}</td>
                          <td style={pageStyles.td}>{materia.nombre}</td>
                          <td style={pageStyles.td}>{materia.nota}</td>
                          <td style={pageStyles.td}>{materia.creditosQueOtorga}</td>
                          <td style={pageStyles.td}>{formatFecha(materia.fechaAprobacion)}</td>
                          <td style={pageStyles.td}>{materia.numeroCorrelativoActa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={pageStyles.emptyState}>
                  No tenés materias aprobadas registradas
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
          </>
        ) : (
          <div style={pageStyles.headerCard}>
            <p>No se pudo cargar la historia académica.</p>
            <button
              style={pageStyles.backButton}
              onClick={handleBack}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1F2937'}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
