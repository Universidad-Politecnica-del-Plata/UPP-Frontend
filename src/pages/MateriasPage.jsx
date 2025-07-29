import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {confirmationModalStyles} from '../styles/confirm-modal-styles'
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getTodasMaterias, deleteMateria } from '../api/materiasApi';


const tipoOptions = ["Todos los tipos", "OBLIGATORIA", "OPTATIVA"];

export default function MateriasPage() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: "Todos los tipos",
    creditosOtorga: "Todos",
    creditosNecesarios: "Todos",
    estado: "Todos",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const materiasPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }
        
        const response = await getTodasMaterias();
        setMaterias(response.data);
      } catch (err) {
        console.error("Error al cargar materias:", err);
        
        if (err.response?.status === 401) {
          showNotification('error', "Sesión expirada. Por favor, inicie sesión nuevamente.");
          localStorage.removeItem('authToken');
        } else if (err.response?.status === 403) {
          showNotification('error', "No tiene permisos para acceder a esta información.");
        } else {
          showNotification('error', "Error al cargar las materias.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchMaterias();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const handleDeleteClick = (codigoMateria) => {
    setConfirmDelete(codigoMateria);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteMateria = async (codigoMateria) => {
    try {
      await deleteMateria(codigoMateria);
      
      setConfirmDelete(null);
      
      setMaterias(prevMaterias => 
        prevMaterias.filter(materia => materia.codigoDeMateria !== codigoMateria)
      );
      showNotification('success', "Materia eliminada exitosamente.");

    } catch (err) {
      console.error("Error al eliminar materia:", err);
      showNotification('error', "Error al eliminar la materia.");
      setConfirmDelete(null);
    }
  };

  const filteredMaterias = materias.filter(materia => {
    const matchesSearch = 
      searchTerm === '' || 
      materia.codigoDeMateria.toLowerCase().includes(searchTerm.toLowerCase()) || 
      materia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      materia.contenidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (materia.codigosCorrelativas && Array.isArray(materia.codigosCorrelativas) && 
        materia.codigosCorrelativas.some(correlativa => correlativa.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesTipo = 
      filters.tipo === "Todos los tipos" || 
      materia.tipo === filters.tipo;
    
    return matchesSearch && matchesTipo;
  });

  const indexOfLastMateria = currentPage * materiasPerPage;
  const indexOfFirstMateria = indexOfLastMateria - materiasPerPage;
  const currentMaterias = filteredMaterias.slice(indexOfFirstMateria, indexOfLastMateria);
  const totalPages = Math.ceil(filteredMaterias.length / materiasPerPage);

  const resetFilters = () => {
    setFilters({
      tipo: "Todos los tipos",
      creditosOtorga: "Todos",
      creditosNecesarios: "Todos",
      estado: "Todos",
    });
    setSearchTerm('');
  };

  return (
    <div style={styles.container}>
       <Notification
      show={notification.show}
      type={notification.type}
      message={notification.message}
      onClose={closeNotification}
    />

      <h1 style={styles.heading}>Gestión de Materias</h1>

      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Materia</label>
            <select
              style={styles.select}
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
            >
              {tipoOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
          <label style={styles.label}>Buscar</label>
          <input
            type="text"
            placeholder="código, nombre o contenidos"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          </div>

          <div style={styles.buttonGroup}>
          <button style={styles.newButton} onClick={() => navigate('/CrearMateria')}>
            Nueva Materia
          </button>
          </div>
        
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>Cargando materias...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Código</th>
                <th style={styles.tableHeadCell}>Nombre</th>
                <th style={styles.tableHeadCell}>Contenidos</th>
                <th style={styles.tableHeadCell}>Créditos Otorga</th>
                <th style={styles.tableHeadCell}>Créditos Necesarios</th>
                <th style={styles.tableHeadCell}>Tipo</th>
                <th style={styles.tableHeadCell}>Cuatrimestre</th>
                <th style={styles.tableHeadCell}>Plan de Estudios</th>
                <th style={styles.tableHeadCell}>Correlativas</th>
                <th style={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterias.map(materia => (
                <tr key={materia.codigoDeMateria} style={styles.tableRow}>
                  <td style={styles.tableCell}>{materia.codigoDeMateria}</td>
                  <td style={styles.tableCell}>{materia.nombre}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.truncateText} title={materia.contenidos}>
                      {materia.contenidos}
                    </div>
                  </td>
                  <td style={styles.tableCell}>{materia.creditosQueOtorga}</td>
                  <td style={styles.tableCell}>{materia.creditosNecesarios}</td>
                  <td style={styles.tableCell}>
                    <span style={
                      materia.tipo === 'OBLIGATORIA' ? styles.badgeObligatoria : 
                      materia.tipo === 'OPTATIVA' ? styles.badgeOptativa : 
                      styles.badgeOptativa
                    }>
                      {materia.tipo}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{materia.cuatrimestre || '-'}</td>
                  <td style={styles.tableCell}>{materia.codigoPlanDeEstudios || '-'}</td>
                  <td style={styles.tableCell}>
                    <div>
                      {materia.codigosCorrelativas && Array.isArray(materia.codigosCorrelativas) ? 
                        materia.codigosCorrelativas.map((correlativa, index) => (
                          <div key={index} style={styles.correlativaChip}>
                            {correlativa}
                          </div>
                        )) : 
                        <span>Sin correlativas</span>
                      }
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtonsContainer}>
                      <button style={styles.editButton} title="Editar"   onClick={() => navigate(`/EditarMateria/${materia.codigoDeMateria}`)}
                      >
                        
                        ✏️
                      </button>
                      <button 
                        style={styles.deleteButton} 
                        title="Eliminar" 
                        onClick={() => handleDeleteClick(materia.codigoDeMateria)}
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
              ¿Esta seguro que desea eliminar la materia {confirmDelete}?
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
                onClick={() => handleDeleteMateria(confirmDelete)}
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