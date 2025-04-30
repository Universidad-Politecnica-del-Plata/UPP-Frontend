import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import {styles} from '../styles/upp-style'

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
    tipo: 'OPTATIVA',
    correlativas: ['FIS201', 'MAT201', 'MAt10101'],
    estado: 'Inactivo' 
  },
];

const tipoOptions = ["Todos los tipos", "OBLIGATORIA", "OPTATIVA"];

export default function MateriasPage() {
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
      materia.contenidos.toLowerCase().includes(searchTerm.toLowerCase())||
      materia.correlativas.some(correlativa => correlativa.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipo = 
      filters.tipo === "Todos los tipos" || 
      materia.tipo === filters.tipo;
    
    
    
    return matchesSearch && matchesTipo;
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

  return (
    <div style={styles.container}>
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
          <button style={styles.newButton}>
            Nueva Materia
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
                    materia.tipo === 'OPTATIVA' ? styles.badgeOptativa : 
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
                  </div>
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