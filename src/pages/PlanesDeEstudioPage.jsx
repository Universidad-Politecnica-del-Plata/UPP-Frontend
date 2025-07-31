import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodosPlanesDeEstudio, deletePlanDeEstudios } from '../api/planDeEstudiosApi';

export default function PlanesDeEstudioPage() {
  const [planesDeEstudio, setPlanesDeEstudio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const planesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlanesDeEstudio = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }
        
        const response = await getTodosPlanesDeEstudio();
        setPlanesDeEstudio(response.data);
      } catch (err) {
        console.error("Error al cargar planes de estudio:", err);
        
        if (err.response?.status === 401) {
          showNotification('error', "Sesión expirada. Por favor, inicie sesión nuevamente.");
          localStorage.removeItem('authToken');
        } else if (err.response?.status === 403) {
          showNotification('error', "No tiene permisos para acceder a esta información.");
        } else {
          showNotification('error', "Error al cargar los planes de estudio.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchPlanesDeEstudio();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (codigoPlan) => {
    setConfirmDelete(codigoPlan);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeletePlan = async (codigoPlan) => {
    try {
      await deletePlanDeEstudios(codigoPlan);
      
      setConfirmDelete(null);
      
      setPlanesDeEstudio(prevPlanes => 
        prevPlanes.filter(plan => plan.codigoDePlanDeEstudios !== codigoPlan)
      );
      showNotification('success', "Plan de estudio eliminado exitosamente.");

    } catch (err) {
      console.error("Error al eliminar plan de estudio:", err);
      showNotification('error', "Error al eliminar el plan de estudio.");
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const filteredPlanes = planesDeEstudio.filter(plan => {
    const matchesSearch = 
      searchTerm === '' || 
      plan.codigoDePlanDeEstudios.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.codigoCarrera && plan.codigoCarrera.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan.codigosMaterias && Array.isArray(plan.codigosMaterias) && 
        plan.codigosMaterias.some(codigo => codigo.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });

  const indexOfLastPlan = currentPage * planesPerPage;
  const indexOfFirstPlan = indexOfLastPlan - planesPerPage;
  const currentPlanes = filteredPlanes.slice(indexOfFirstPlan, indexOfLastPlan);
  const totalPages = Math.ceil(filteredPlanes.length / planesPerPage);

  return (
    <div style={styles.container}>
       <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />

      <h1 style={styles.heading}>Gestión de Planes de Estudio</h1>

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="código de plan, código de materia o carrera"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearPlanDeEstudio')}>
            Nuevo Plan de Estudio
          </button>
          </div>
        
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando planes de estudio...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Código</th>
                <th style={styles.tableHeadCell}>Créditos Electivos</th>
                <th style={styles.tableHeadCell}>Créditos Obligatorios</th>
                <th style={styles.tableHeadCell}>Fecha Entrada en Vigencia</th>
                <th style={styles.tableHeadCell}>Fecha Vencimiento</th>
                <th style={styles.tableHeadCell}>Carrera</th>
                <th style={styles.tableHeadCell}>Materias</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPlanes.map(plan => (
                <tr key={plan.codigoDePlanDeEstudios} style={styles.tableRow}>
                  <td style={styles.tableCell}>{plan.codigoDePlanDeEstudios}</td>
                  <td style={styles.tableCell}>{plan.creditosElectivos}</td>
                  <td style={styles.tableCell}>{plan.creditosObligatorios}</td>
                  <td style={styles.tableCell}>{formatDate(plan.fechaEntradaEnVigencia)}</td>
                  <td style={styles.tableCell}>{formatDate(plan.fechaVencimiento)}</td>
                  <td style={styles.tableCell}>{plan.codigoCarrera || '-'}</td>
                  <td style={styles.tableCell}>
                    <div>
                      {plan.codigosMaterias && Array.isArray(plan.codigosMaterias) ? 
                        plan.codigosMaterias.map((codigoMateria, index) => (
                          <div key={index} style={styles.correlativaChip}>
                            {codigoMateria}
                          </div>
                        )) : 
                        <span>Sin materias</span>
                      }
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarPlanDeEstudios/${plan.codigoDePlanDeEstudios}`)}
                      >
                        ✏️
                      </button>
                      <button 
                        style={styles.deleteButton} 
                        title="Eliminar" 
                        onClick={() => handleDeleteClick(plan.codigoDePlanDeEstudios)}
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
              ¿Esta seguro que desea eliminar el plan de estudio {confirmDelete}?
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
                onClick={() => handleDeletePlan(confirmDelete)}
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