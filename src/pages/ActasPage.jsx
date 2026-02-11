import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodasActas, getActasPorCurso, actualizarEstadoActa } from '../api/actasApi';
import { getTodosCursos } from '../api/cursosApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function ActasPage() {
  const [actas, setActas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCurso, setFilterCurso] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmClose, setConfirmClose] = useState(null);
  const actasPerPage = 5;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }
        const response = await getTodosCursos();
        setCursos(response.data);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
        const errorMessage = getErrorMessage(err, "Error al cargar los cursos.");
        showNotification('error', errorMessage);
      }
    };
    fetchCursos();
  }, []);

 
  useEffect(() => {
    const fetchActas = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('authToken');

        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }

        
        const response = filterCurso
          ? await getActasPorCurso(filterCurso)
          : await getTodasActas();

        setActas(response.data);
      } catch (err) {
        console.error("Error al cargar actas:", err);

        const errorMessage = getErrorMessage(err, "Error al cargar las actas.");
        showNotification('error', errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActas();
  }, [filterCurso]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTipoChange = (e) => {
    setFilterTipo(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setFilterEstado(e.target.value);
  };

  const handleCloseClick = (numeroCorrelativo) => {
    setConfirmClose(numeroCorrelativo);
  };

  const handleCancelClose = () => {
    setConfirmClose(null);
  };

  const handleCerrarActa = async (numeroCorrelativo) => {
    try {
      await actualizarEstadoActa(numeroCorrelativo, { estado: 'CERRADA' });

      setConfirmClose(null);

      setActas(prevActas =>
        prevActas.map(acta =>
          acta.numeroCorrelativo === numeroCorrelativo
            ? { ...acta, estado: 'CERRADA' }
            : acta
        )
      );
      showNotification('success', "Acta cerrada exitosamente.");

    } catch (err) {
      console.error("Error al cerrar acta:", err);
      const errorMessage = getErrorMessage(err, "Error al cerrar el acta.");
      showNotification('error', errorMessage);
      setConfirmClose(null);
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActas = actas.filter(acta => {
    const matchesSearch =
      searchTerm === '' ||
      acta.numeroCorrelativo.toString().includes(searchTerm) ||
      acta.codigoCurso.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = filterTipo === '' || acta.tipoDeActa === filterTipo;
    const matchesEstado = filterEstado === '' || acta.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const indexOfLastActa = currentPage * actasPerPage;
  const indexOfFirstActa = indexOfLastActa - actasPerPage;
  const currentActas = filteredActas.slice(indexOfFirstActa, indexOfLastActa);
  const totalPages = Math.ceil(filteredActas.length / actasPerPage);

  return (
    <>
      <Header title="Gestión de Actas" />
      <div style={styles.container}>
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />

      <div style={styles.filtersContainer}>
        <div style={{
          ...styles.filtersGrid,
          width: '100%',
          gap: '16px'
        }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Curso</label>
            <select
              style={{...styles.select, minWidth: '200px'}}
              value={filterCurso}
              onChange={(e) => setFilterCurso(e.target.value)}
            >
              <option value="">Todas las actas</option>
              {cursos.map(curso => (
                <option key={curso.codigo} value={curso.codigo}>
                  {curso.codigo} - {curso.codigoMateria}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="número correlativo o código de curso"
            style={{...styles.searchInput, minWidth: '250px'}}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Acta</label>
            <select
              style={{...styles.select, minWidth: '150px'}}
              value={filterTipo}
              onChange={handleTipoChange}
            >
              <option value="">Todos</option>
              <option value="FINAL">FINAL</option>
              <option value="CURSADA">CURSADA</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Estado del Acta</label>
            <select
              style={{...styles.select, minWidth: '150px'}}
              value={filterEstado}
              onChange={handleEstadoChange}
            >
              <option value="">Todos</option>
              <option value="ABIERTA">ABIERTA</option>
              <option value="CERRADA">CERRADA</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
          <button
            style={{...styles.newButton, minWidth: '150px'}}
            onClick={() => navigate('/AbrirActa')}
          >
            Abrir Nueva Acta
          </button>
          </div>

        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando actas...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Nro. Correlativo</th>
                <th style={styles.tableHeadCell}>Tipo</th>
                <th style={styles.tableHeadCell}>Fecha Creación</th>
                <th style={styles.tableHeadCell}>Estado</th>
                <th style={styles.tableHeadCell}>Código Curso</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentActas.map(acta => {
                const getTipoActaStyle = (tipo) => {
                  switch(tipo) {
                    case 'FINAL':
                      return styles.badgeObligatoria;
                    case 'CURSADA':
                      return styles.correlativaChip;
                    default:
                      return styles.correlativaChip;
                  }
                };

                return (
                <tr key={acta.numeroCorrelativo} style={styles.tableRow}>
                  <td style={styles.tableCell}>{acta.numeroCorrelativo}</td>
                  <td style={styles.tableCell}>
                    <span style={getTipoActaStyle(acta.tipoDeActa)}>
                      {acta.tipoDeActa}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{formatFecha(acta.fechaDeCreacion)}</td>
                  <td style={styles.tableCell}>
                    <span style={acta.estado === 'ABIERTA' ? styles.statusActive : styles.statusInactive}>
                      {acta.estado}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{acta.codigoCurso}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button
                        style={{
                          ...styles.applyButton,
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        onClick={() => navigate(`/VerActa/${acta.numeroCorrelativo}`)}
                      >
                        Ver
                      </button>
                      {acta.estado === 'ABIERTA' && (
                        <button
                          style={{
                            background: '#f59e0b',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={() => handleCloseClick(acta.numeroCorrelativo)}
                        >
                          Cerrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.pagination}>
        <div style={styles.paginationNav}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
              ...styles.paginationButtonLeft
            }}
          >
            &laquo;
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  ...styles.paginationPageButton,
                  ...(currentPage === pageNum ? styles.paginationPageButtonActive : {})
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{
              ...styles.paginationButton,
              ...(currentPage === totalPages || totalPages === 0 ? styles.paginationButtonDisabled : {}),
              ...styles.paginationButtonRight
            }}
          >
            &raquo;
          </button>
        </div>
      </div>

      {confirmClose && (
        <div style={confirmationModalStyles.simpleOverlay}>
          <div style={confirmationModalStyles.simpleModal}>
            <p style={confirmationModalStyles.simpleMessage}>
              ¿Está seguro que desea cerrar el acta {confirmClose}?
            </p>
            <div style={confirmationModalStyles.simpleButtons}>
              <button
                style={confirmationModalStyles.simpleCancelButton}
                onClick={handleCancelClose}
              >
                Cancelar
              </button>
              <button
                style={confirmationModalStyles.simpleConfirmButton}
                onClick={() => handleCerrarActa(confirmClose)}
              >
                Cerrar Acta
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
