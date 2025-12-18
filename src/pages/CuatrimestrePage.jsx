import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodosCuatrimestres, deleteCuatrimestre } from '../api/cuatrimestresApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function CuatrimestrePage() {
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const cuatrimestresPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCuatrimestres = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('authToken');

        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }

        const response = await getTodosCuatrimestres();
        setCuatrimestres(response.data);
      } catch (err) {
        console.error("Error al cargar cuatrimestres:", err);

        const errorMessage = getErrorMessage(err, "Error al cargar los cuatrimestres.");
        showNotification('error', errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCuatrimestres();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (codigo) => {
    setConfirmDelete(codigo);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteCuatrimestre = async (codigo) => {
    try {
      await deleteCuatrimestre(codigo);

      setConfirmDelete(null);

      setCuatrimestres(prevCuatrimestres =>
        prevCuatrimestres.filter(cuatrimestre => cuatrimestre.codigo !== codigo)
      );
      showNotification('success', "Cuatrimestre eliminado exitosamente.");

    } catch (err) {
      console.error("Error al eliminar cuatrimestre:", err);

      const errorMessage = getErrorMessage(err, "Error al eliminar el cuatrimestre.");
      showNotification('error', errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
      }

      setConfirmDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  const filteredCuatrimestres = cuatrimestres.filter(cuatrimestre => {
    const matchesSearch =
      searchTerm === '' ||
      cuatrimestre.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuatrimestre.codigosCursos && Array.isArray(cuatrimestre.codigosCursos) &&
        cuatrimestre.codigosCursos.some(codigo => codigo.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesSearch;
  });

  const indexOfLastCuatrimestre = currentPage * cuatrimestresPerPage;
  const indexOfFirstCuatrimestre = indexOfLastCuatrimestre - cuatrimestresPerPage;
  const currentCuatrimestres = filteredCuatrimestres.slice(indexOfFirstCuatrimestre, indexOfLastCuatrimestre);
  const totalPages = Math.ceil(filteredCuatrimestres.length / cuatrimestresPerPage);

  return (
    <div style={styles.container}>
       <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />

      <h1 style={styles.heading}>Gestión de Cuatrimestres</h1>

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="código o cursos"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearCuatrimestre')}>
            Nuevo Cuatrimestre
          </button>
          </div>

        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando cuatrimestres...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Código</th>
                <th style={styles.tableHeadCell}>Inicio Clases</th>
                <th style={styles.tableHeadCell}>Fin Clases</th>
                <th style={styles.tableHeadCell}>Inicio Inscripción</th>
                <th style={styles.tableHeadCell}>Fin Inscripción</th>
                <th style={styles.tableHeadCell}>Inicio Integradores</th>
                <th style={styles.tableHeadCell}>Fin Integradores</th>
                <th style={styles.tableHeadCell}>Cursos</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCuatrimestres.map(cuatrimestre => (
                <tr key={cuatrimestre.codigo} style={styles.tableRow}>
                  <td style={styles.tableCell}>{cuatrimestre.codigo}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaDeInicioClases)}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaDeFinClases)}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaInicioPeriodoDeInscripcion)}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaFinPeriodoDeInscripcion)}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaInicioPeriodoIntegradores)}</td>
                  <td style={styles.tableCell}>{formatDate(cuatrimestre.fechaFinPeriodoIntegradores)}</td>
                  <td style={styles.tableCell}>
                    <div>
                      {cuatrimestre.codigosCursos && Array.isArray(cuatrimestre.codigosCursos) ?
                        cuatrimestre.codigosCursos.map((codigoCurso, index) => (
                          <div key={index} style={styles.correlativaChip}>
                            {codigoCurso}
                          </div>
                        )) :
                        <span>Sin cursos</span>
                      }
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarCuatrimestre/${cuatrimestre.codigo}`)}
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.deleteButton}
                        title="Eliminar"
                        onClick={() => handleDeleteClick(cuatrimestre.codigo)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {confirmDelete && (
        <div style={confirmationModalStyles.simpleOverlay}>
          <div style={confirmationModalStyles.simpleModal}>
            <p style={confirmationModalStyles.simpleMessage}>
              ¿Esta seguro que desea eliminar el cuatrimestre con código {confirmDelete}?
            </p>
            <div style={confirmationModalStyles.simpleButtons}>
              <button
                style={confirmationModalStyles.simpleCancelButton}
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button
                style={confirmationModalStyles.simpleConfirmButton}
                onClick={() => handleDeleteCuatrimestre(confirmDelete)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
