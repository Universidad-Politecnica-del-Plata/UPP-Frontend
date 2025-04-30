import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';

// Sample data based on Java class
const initialMaterias = [
  { 
    id: 1, 
    codigoDeMateria: 'MAT101', 
    nombre: 'Álgebra Lineal', 
    contenidos: 'Matrices, Vectores, Espacios Vectoriales',
    creditosQueOtorga: 6, 
    creditosNecesarios: 0, 
    tipo: 'OBLIGATORIA',
    correlativas: ['MAT100'],
    estado: 'Activo' 
  },
  { 
    id: 2, 
    codigoDeMateria: 'INF201', 
    nombre: 'Programación Orientada a Objetos', 
    contenidos: 'Clases, Herencia, Polimorfismo',
    creditosQueOtorga: 8, 
    creditosNecesarios: 12, 
    tipo: 'OBLIGATORIA',
    correlativas: ['INF101', 'INF102'],
    estado: 'Activo' 
  },
  { 
    id: 3, 
    codigoDeMateria: 'FIS301', 
    nombre: 'Física Cuántica', 
    contenidos: 'Mecánica cuántica, Dualidad onda-partícula',
    creditosQueOtorga: 10, 
    creditosNecesarios: 24, 
    tipo: 'ELECTIVA',
    correlativas: ['FIS201', 'MAT201'],
    estado: 'Inactivo' 
  },
];

const tipoOptions = ["Todos los tipos", "OBLIGATORIA", "ELECTIVA", "OPTATIVA"];
const creditosOtorgaOptions = ["Todos", "4", "6", "8", "10", "12"];
const creditosNecesariosOptions = ["Todos", "0", "12", "24", "36", "48"];
const estadoOptions = ["Todos", "Activo", "Inactivo"];

export default function GestionMaterias() {
  const [materias, setMaterias] = useState(initialMaterias);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: "Todos los tipos",
    creditosOtorga: "Todos",
    creditosNecesarios: "Todos",
    estado: "Todos",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const materiasPerPage = 5;

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  // Apply filters and search
  const filteredMaterias = materias.filter(materia => {
    const matchesSearch = 
      searchTerm === '' || 
      materia.codigoDeMateria.toLowerCase().includes(searchTerm.toLowerCase()) || 
      materia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      materia.contenidos.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = 
      filters.tipo === "Todos los tipos" || 
      materia.tipo === filters.tipo;
    
    const matchesCreditosOtorga = 
      filters.creditosOtorga === "Todos" || 
      materia.creditosQueOtorga.toString() === filters.creditosOtorga;
      
    const matchesCreditosNecesarios = 
      filters.creditosNecesarios === "Todos" || 
      materia.creditosNecesarios.toString() === filters.creditosNecesarios;
    
    const matchesEstado = 
      filters.estado === "Todos" || 
      materia.estado === filters.estado;
    
    return matchesSearch && matchesTipo && matchesCreditosOtorga && matchesCreditosNecesarios && matchesEstado;
  });

  // Pagination
  const indexOfLastMateria = currentPage * materiasPerPage;
  const indexOfFirstMateria = indexOfLastMateria - materiasPerPage;
  const currentMaterias = filteredMaterias.slice(indexOfFirstMateria, indexOfLastMateria);
  const totalPages = Math.ceil(filteredMaterias.length / materiasPerPage);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      tipo: "Todos los tipos",
      creditosOtorga: "Todos",
      creditosNecesarios: "Todos",
      estado: "Todos",
    });
    setSearchTerm('');
  };

  // Basic styling objects to replace Tailwind classes
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
    },
    headerButton: {
      display: 'flex',
      alignItems: 'center',
      color: '#4B5563',
      marginRight: '16px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    headerButtonText: {
      marginLeft: '4px',
    },
    spacer: {
      flexGrow: 1,
    },
    actionButton: {
      background: '#E5E7EB',
      padding: '4px 12px',
      borderRadius: '4px',
      marginRight: '8px',
      border: 'none',
      cursor: 'pointer',
    },
    closeButton: {
      color: '#4B5563',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
    },
    heading: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    searchInput: {
      border: '1px solid #D1D5DB',
      borderRadius: '4px',
      padding: '8px',
      width: '250px',
    },
    searchButton: {
      background: '#3B82F6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      marginLeft: '8px',
      border: 'none',
      cursor: 'pointer',
    },
    newButton: {
      background: '#10B981',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
    },
    filtersContainer: {
      marginBottom: '24px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      padding: '16px',
      background: '#F9FAFB',
    },
    filtersTitle: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    },
    formGroup: {
      marginBottom: '12px',
    },
    label: {
      display: 'block',
      marginBottom: '4px',
      fontSize: '14px',
      fontWeight: '500',
    },
    select: {
      border: '1px solid #D1D5DB',
      borderRadius: '4px',
      padding: '8px',
      width: '100%',
      fontSize: '14px',
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'flex-end',
    },
    applyButton: {
      background: '#3B82F6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      marginRight: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
    },
    resetButton: {
      background: '#E5E7EB',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      minWidth: '100%',
      backgroundColor: 'white',
      borderCollapse: 'collapse',
    },
    tableHead: {
      borderBottom: '1px solid #E5E7EB',
    },
    tableHeadCell: {
      padding: '8px 16px',
      textAlign: 'left',
      fontWeight: '500',
    },
    tableRow: {
      borderBottom: '1px solid #E5E7EB',
    },
    tableRowHover: {
      backgroundColor: '#F9FAFB',
    },
    tableCell: {
      padding: '8px 16px',
    },
    truncateText: {
      width: '150px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    badgeObligatoria: {
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
      display: 'inline-block',
    },
    badgeElectiva: {
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#F3E8FF',
      color: '#6B21A8',
      display: 'inline-block',
    },
    badgeOptativa: {
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#FFEDD5',
      color: '#9A3412',
      display: 'inline-block',
    },
    correlativaChip: {
      background: '#F3F4F6',
      color: '#374151',
      padding: '4px 8px',
      borderRadius: '4px',
      marginBottom: '4px',
      display: 'inline-block',
      marginRight: '4px',
    },
    correlativaMore: {
      color: '#3B82F6',
      fontWeight: '500',
    },
    statusActive: {
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#D1FAE5',
      color: '#065F46',
      display: 'inline-block',
    },
    statusInactive: {
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      display: 'inline-block',
    },
    actionButtonsContainer: {
      display: 'flex',
      gap: '8px',
    },
    editButton: {
      color: '#FBBF24',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    deleteButton: {
      color: '#EF4444',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '16px',
    },
    paginationNav: {
      display: 'flex',
      alignItems: 'center',
    },
    paginationButton: {
      border: '1px solid #D1D5DB',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    paginationButtonLeft: {
      borderTopLeftRadius: '4px',
      borderBottomLeftRadius: '4px',
    },
    paginationButtonRight: {
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px',
    },
    paginationPageButton: {
      border: '1px solid #D1D5DB',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '4px 12px',
      backgroundColor: 'white',
    },
    paginationPageButtonActive: {
      backgroundColor: '#3B82F6',
      color: 'white',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.headerButton}>
          <ChevronLeft size={20} />
          <span style={styles.headerButtonText}>Sistema de Gestión de Materias</span>
        </button>
        <div style={styles.spacer}></div>
        <button style={styles.actionButton}>Preview</button>
        <button style={styles.actionButton}>Code</button>
        <button style={styles.closeButton}>✕</button>
      </div>

      <h1 style={styles.heading}>Gestión de Materias</h1>
      
      {/* Search bar and New Materia button */}
      <div style={styles.searchContainer}>
        <div style={{display: 'flex'}}>
          <input
            type="text"
            placeholder="Buscar por código, nombre o contenidos"
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button style={styles.searchButton}>
            Buscar
          </button>
        </div>
        <button style={styles.newButton}>
          Nueva Materia
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <h2 style={styles.filtersTitle}>Filtros</h2>
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
            <label style={styles.label}>Créditos que Otorga</label>
            <select
              style={styles.select}
              value={filters.creditosOtorga}
              onChange={(e) => handleFilterChange('creditosOtorga', e.target.value)}
            >
              {creditosOtorgaOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Créditos Necesarios</label>
            <select
              style={styles.select}
              value={filters.creditosNecesarios}
              onChange={(e) => handleFilterChange('creditosNecesarios', e.target.value)}
            >
              {creditosNecesariosOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Estado</label>
            <select
              style={styles.select}
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
            >
              {estadoOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.buttonGroup}>
            <button
              style={styles.applyButton}
              onClick={() => {/* Apply filters logic */}}
            >
              Aplicar Filtros
            </button>
            <button
              style={styles.resetButton}
              onClick={resetFilters}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Materias Table */}
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
              <th style={styles.tableHeadCell}>Correlativas</th>
              <th style={styles.tableHeadCell}>Estado</th>
              <th style={styles.tableHeadCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMaterias.map(materia => (
              <tr key={materia.id} style={styles.tableRow}>
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
                    materia.tipo === 'ELECTIVA' ? styles.badgeElectiva : 
                    styles.badgeOptativa
                  }>
                    {materia.tipo}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div>
                    {materia.correlativas.map((correlativa, index) => (
                      <div key={index} style={styles.correlativaChip}>
                        {correlativa}
                      </div>
                    ))}
                    {materia.correlativas.length > 1 && (
                      <div style={styles.correlativaMore}>+{materia.correlativas.length - 1}</div>
                    )}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={materia.estado === 'Activo' ? styles.statusActive : styles.statusInactive}>
                    {materia.estado}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtonsContainer}>
                    <button style={styles.editButton}>
                      <Edit size={18} />
                    </button>
                    <button style={styles.deleteButton}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
            <ChevronLeft size={16} />
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
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}