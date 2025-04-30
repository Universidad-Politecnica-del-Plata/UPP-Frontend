import { useState } from 'react';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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

// Available options for filters
const tipoOptions = ["Todos los tipos", "OBLIGATORIA", "ELECTIVA", "OPTATIVA"];
const creditosOtorgaOptions = ["Todos", "4", "6", "8", "10", "12"];
const creditosNecesariosOptions = ["Todos", "0", "12", "24", "36", "48"];
const estadoOptions = ["Todos", "Activo", "Inactivo"];
const yearOptions = ["Todos", "2020", "2021", "2022", "2023", "2024"];

export default function MateriasPage() {
  const [materias, setMaterias] = useState(initialMaterias);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: "Todos los tipos",
    creditosOtorga: "Todos",
    creditosNecesarios: "Todos",
    estado: "Todos",
    correlativas: "Todos",
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
    
    // In a real application, you would have more filter logic here
    
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
      correlativas: "Todos",
    });
    setSearchTerm('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-4">
        <button className="flex items-center text-gray-600 mr-4">
          <ChevronLeft size={20} />
          <span className="ml-1">Sistema de Gestión de Materias</span>
        </button>
        <div className="flex-grow"></div>
        <button className="bg-gray-200 px-3 py-1 rounded mr-2">Preview</button>
        <button className="bg-gray-200 px-3 py-1 rounded mr-2">Code</button>
        <button className="text-gray-600">✕</button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Gestión de Materias</h1>
      
      {/* Search bar and New Materia button */}
      <div className="flex justify-between mb-6">
        <div className="flex">
          <input
            type="text"
            placeholder="Buscar por código, nombre o contenidos"
            className="border rounded p-2 w-64"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
            Buscar
          </button>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Nueva Materia
        </button>
      </div>

      {/* Filters in a container */}
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-medium mb-2">Filtros</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Tipo de Materia</label>
            <select
              className="border rounded p-2 w-full text-sm"
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
            >
              {tipoOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Créditos que Otorga</label>
            <select
              className="border rounded p-2 w-full text-sm"
              value={filters.creditosOtorga}
              onChange={(e) => handleFilterChange('creditosOtorga', e.target.value)}
            >
              {creditosOtorgaOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Créditos Necesarios</label>
            <select
              className="border rounded p-2 w-full text-sm"
              value={filters.creditosNecesarios}
              onChange={(e) => handleFilterChange('creditosNecesarios', e.target.value)}
            >
              {creditosNecesariosOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Estado</label>
            <select
              className="border rounded p-2 w-full text-sm"
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
            >
              {estadoOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 text-sm"
              onClick={() => {/* Apply filters logic */}}
            >
              Aplicar Filtros
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded text-sm"
              onClick={resetFilters}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Código</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Contenidos</th>
              <th className="py-2 px-4 text-left">Créditos Otorga</th>
              <th className="py-2 px-4 text-left">Créditos Necesarios</th>
              <th className="py-2 px-4 text-left">Tipo</th>
              <th className="py-2 px-4 text-left">Correlativas</th>
              <th className="py-2 px-4 text-left">Estado</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMaterias.map(materia => (
              <tr key={materia.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{materia.codigoDeMateria}</td>
                <td className="py-2 px-4">{materia.nombre}</td>
                <td className="py-2 px-4">
                  <div className="truncate w-32" title={materia.contenidos}>
                    {materia.contenidos}
                  </div>
                </td>
                <td className="py-2 px-4">{materia.creditosQueOtorga}</td>
                <td className="py-2 px-4">{materia.creditosNecesarios}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded ${
                    materia.tipo === 'OBLIGATORIA' ? 'bg-blue-100 text-blue-800' : 
                    materia.tipo === 'ELECTIVA' ? 'bg-purple-100 text-purple-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {materia.tipo}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div>
                    {materia.correlativas.map((correlativa, index) => (
                      <div key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded mb-1 inline-block mr-1">
                        {correlativa}
                      </div>
                    ))}
                    {materia.correlativas.length > 1 && (
                      <div className="text-blue-500 font-medium">+{materia.correlativas.length - 1}</div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded ${
                    materia.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {materia.estado}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2">
                    <button className="text-yellow-500 hover:text-yellow-700">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
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
      <div className="flex justify-center mt-4">
        <nav className="flex items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded-l flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border-t border-b ${
                  currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 border rounded-r flex items-center justify-center disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}