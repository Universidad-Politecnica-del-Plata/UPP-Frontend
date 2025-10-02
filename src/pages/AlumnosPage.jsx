import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodosLosAlumnosActivos, deleteAlumno } from '../api/alumnosApi';
import { getErrorMessage } from '../utils/errorHandler';

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const alumnosPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }
        
        const response = await getTodosLosAlumnosActivos();
        setAlumnos(response.data);
      } catch (err) {
        console.error("Error al cargar alumnos:", err);
        
        const errorMessage = getErrorMessage(err, "Error al cargar los alumnos.");
        showNotification('error', errorMessage);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAlumnos();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (matricula) => {
    setConfirmDelete(matricula);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteAlumno = async (matricula) => {
    try {
      await deleteAlumno(matricula);
      
      setConfirmDelete(null);
      
      setAlumnos(prevAlumnos => 
        prevAlumnos.filter(alumno => alumno.matricula !== matricula)
      );
      showNotification('success', "Alumno eliminado exitosamente.");

    } catch (err) {
      console.error("Error al eliminar alumno:", err);
      
      const errorMessage = getErrorMessage(err, "Error al eliminar el alumno.");
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

  const filteredAlumnos = alumnos.filter(alumno => {
    const matchesSearch = 
      searchTerm === '' || 
      alumno.matricula.toString().includes(searchTerm) ||
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.dni.toString().includes(searchTerm) ||
      alumno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumno.codigosCarreras && Array.isArray(alumno.codigosCarreras) && 
        alumno.codigosCarreras.some(codigo => codigo.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (alumno.codigosPlanesDeEstudio && Array.isArray(alumno.codigosPlanesDeEstudio) && 
        alumno.codigosPlanesDeEstudio.some(codigo => codigo.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });

  const indexOfLastAlumno = currentPage * alumnosPerPage;
  const indexOfFirstAlumno = indexOfLastAlumno - alumnosPerPage;
  const currentAlumnos = filteredAlumnos.slice(indexOfFirstAlumno, indexOfLastAlumno);
  const totalPages = Math.ceil(filteredAlumnos.length / alumnosPerPage);

  return (
    <div style={styles.container}>
       <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />

      <h1 style={styles.heading}>Gestión de Alumnos</h1>

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="matrícula, nombre, apellido, DNI, email, carreras o planes de estudio"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearAlumno')}>
            Nuevo Alumno
          </button>
          </div>
        
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando alumnos...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Matrícula</th>
                <th style={styles.tableHeadCell}>Nombre Completo</th>
                <th style={styles.tableHeadCell}>DNI</th>
                <th style={styles.tableHeadCell}>Email</th>
                <th style={styles.tableHeadCell}>Fecha Ingreso</th>
                <th style={styles.tableHeadCell}>Carreras</th>
                <th style={styles.tableHeadCell}>Planes de Estudio</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentAlumnos.map(alumno => (
                <tr key={alumno.matricula} style={styles.tableRow}>
                  <td style={styles.tableCell}>{alumno.matricula}</td>
                  <td style={styles.tableCell}>{alumno.nombre} {alumno.apellido}</td>
                  <td style={styles.tableCell}>{alumno.dni}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.truncateText} title={alumno.email}>
                      {alumno.email}
                    </div>
                  </td>
                  <td style={styles.tableCell}>{formatDate(alumno.fechaIngreso)}</td>
                  <td style={styles.tableCell}>
                    <div>
                      {alumno.codigosCarreras && Array.isArray(alumno.codigosCarreras) ? 
                        alumno.codigosCarreras.map((codigoCarrera, index) => (
                          <div key={index} style={styles.correlativaChip}>
                            {codigoCarrera}
                          </div>
                        )) : 
                        <span>Sin carreras</span>
                      }
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div>
                      {alumno.codigosPlanesDeEstudio && Array.isArray(alumno.codigosPlanesDeEstudio) ? 
                        alumno.codigosPlanesDeEstudio.map((codigoPlan, index) => (
                          <div key={index} style={styles.correlativaChip}>
                            {codigoPlan}
                          </div>
                        )) : 
                        <span>Sin planes de estudio</span>
                      }
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarAlumno/${alumno.matricula}`)}
                      >
                        ✏️
                      </button>
                      <button 
                        style={styles.deleteButton} 
                        title="Eliminar" 
                        onClick={() => handleDeleteClick(alumno.matricula)}
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
              ¿Esta seguro que desea eliminar el alumno con matrícula {confirmDelete}?
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
                onClick={() => handleDeleteAlumno(confirmDelete)}
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