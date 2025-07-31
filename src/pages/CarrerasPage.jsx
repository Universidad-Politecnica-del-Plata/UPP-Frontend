import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodasCarreras, deleteCarrera } from '../api/carrerasApi';

export default function CarrerasPage() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const carrerasPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }
        
        const response = await getTodasCarreras();
        setCarreras(response.data);
      } catch (err) {
        console.error("Error al cargar carreras:", err);
        
        if (err.response?.status === 401) {
          showNotification('error', "Sesión expirada. Por favor, inicie sesión nuevamente.");
          localStorage.removeItem('authToken');
        } else if (err.response?.status === 403) {
          showNotification('error', "No tiene permisos para acceder a esta información.");
        } else {
          showNotification('error', "Error al cargar las carreras.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchCarreras();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (codigoCarrera) => {
    setConfirmDelete(codigoCarrera);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteCarrera = async (codigoCarrera) => {
    try {
      await deleteCarrera(codigoCarrera);
      
      setConfirmDelete(null);
      
      setCarreras(prevCarreras => 
        prevCarreras.filter(carrera => carrera.codigoDeCarrera !== codigoCarrera)
      );
      showNotification('success', "Carrera eliminada exitosamente.");

    } catch (err) {
      console.error("Error al eliminar carrera:", err);
      showNotification('error', "Error al eliminar la carrera.");
      setConfirmDelete(null);
    }
  };

  const filteredCarreras = carreras.filter(carrera => {
    const matchesSearch = 
      searchTerm === '' || 
      carrera.codigoDeCarrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrera.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (carrera.incumbencias && carrera.incumbencias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (carrera.codigosPlanesDeEstudio && Array.isArray(carrera.codigosPlanesDeEstudio) && 
        carrera.codigosPlanesDeEstudio.some(codigo => codigo.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });

  const indexOfLastCarrera = currentPage * carrerasPerPage;
  const indexOfFirstCarrera = indexOfLastCarrera - carrerasPerPage;
  const currentCarreras = filteredCarreras.slice(indexOfFirstCarrera, indexOfLastCarrera);
  const totalPages = Math.ceil(filteredCarreras.length / carrerasPerPage);

  return (
    <div style={styles.container}>
       <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />

      <h1 style={styles.heading}>Gestión de Carreras</h1>

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="código, nombre, título, incumbencias o planes de estudio"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearCarrera')}>
            Nueva Carrera
          </button>
          </div>
        
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando carreras...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Código</th>
                <th style={styles.tableHeadCell}>Nombre</th>
                <th style={styles.tableHeadCell}>Título</th>
                <th style={styles.tableHeadCell}>Incumbencias</th>
                <th style={styles.tableHeadCell}>Planes de Estudio</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCarreras.map(carrera => (
                <tr key={carrera.codigoDeCarrera} style={styles.tableRow}>
                  <td style={styles.tableCell}>{carrera.codigoDeCarrera}</td>
                  <td style={styles.tableCell}>{carrera.nombre}</td>
                  <td style={styles.tableCell}>{carrera.titulo}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.truncateText} title={carrera.incumbencias}>
                      {carrera.incumbencias || '-'}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div>
                      {carrera.codigosPlanesDeEstudio && Array.isArray(carrera.codigosPlanesDeEstudio) ? 
                        carrera.codigosPlanesDeEstudio.map((codigoPlan, index) => (
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
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarCarrera/${carrera.codigoDeCarrera}`)}
                      >
                        ✏️
                      </button>
                      <button 
                        style={styles.deleteButton} 
                        title="Eliminar" 
                        onClick={() => handleDeleteClick(carrera.codigoDeCarrera)}
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
              ¿Esta seguro que desea eliminar la carrera {confirmDelete}?
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
                onClick={() => handleDeleteCarrera(confirmDelete)}
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