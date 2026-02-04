import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Header from '../components/Header';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodosCursos, deleteCurso } from '../api/cursosApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function CursosPage() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const cursosPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);

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

        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (codigoCurso) => {
    setConfirmDelete(codigoCurso);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteCurso = async (codigoCurso) => {
    try {
      await deleteCurso(codigoCurso);

      setConfirmDelete(null);

      setCursos(prevCursos =>
        prevCursos.filter(curso => curso.codigo !== codigoCurso)
      );
      showNotification('success', "Curso eliminado exitosamente.");

    } catch (err) {
      console.error("Error al eliminar curso:", err);
      const errorMessage = getErrorMessage(err, "Error al eliminar el curso.");
      showNotification('error', errorMessage);
      setConfirmDelete(null);
    }
  };

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch =
      searchTerm === '' ||
      curso.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.codigoMateria.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const indexOfLastCurso = currentPage * cursosPerPage;
  const indexOfFirstCurso = indexOfLastCurso - cursosPerPage;
  const currentCursos = filteredCursos.slice(indexOfFirstCurso, indexOfLastCurso);
  const totalPages = Math.ceil(filteredCursos.length / cursosPerPage);

  return (
    <>
      <Header title="Gestión de Cursos" />
      <div style={styles.container}>
        <Notification
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="código de curso o materia"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearCurso')}>
            Nuevo Curso
          </button>
          </div>

        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando cursos...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Código</th>
                <th style={styles.tableHeadCell}>Máximo de Alumnos</th>
                <th style={styles.tableHeadCell}>Código de Materia</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCursos.map(curso => (
                <tr key={curso.codigo} style={styles.tableRow}>
                  <td style={styles.tableCell}>{curso.codigo}</td>
                  <td style={styles.tableCell}>{curso.maximoDeAlumnos}</td>
                  <td style={styles.tableCell}>{curso.codigoMateria}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarCurso/${curso.codigo}`)}
                      >

                        ✏️
                      </button>
                      <button
                        style={styles.deleteButton}
                        title="Eliminar"
                        onClick={() => handleDeleteClick(curso.codigo)}
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
              ¿Esta seguro que desea eliminar el curso {confirmDelete}?
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
                onClick={() => handleDeleteCurso(confirmDelete)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
