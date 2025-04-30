import { useState } from 'react';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import {styles} from '../styles/upp-style'

const NuevaMateriaForm = () => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    contenidos: '',
    creditosOtorga: '',
    creditosNecesarios: '',
    tipo: 'OBLIGATORIA',
    correlativas: []
  });

  const [newCorrelativa, setNewCorrelativa] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddCorrelativa = () => {
    if (newCorrelativa.trim() !== '') {
      setFormData(prevState => ({
        ...prevState,
        correlativas: [...prevState.correlativas, newCorrelativa.trim()]
      }));
      setNewCorrelativa('');
    }
  };

  const handleRemoveCorrelativa = (index) => {
    setFormData(prevState => ({
      ...prevState,
      correlativas: prevState.correlativas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would handle the form submission logic
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.headerButton}>
          <ArrowLeft size={16} />
          <span style={styles.headerButtonText}>Volver a Gestión de Materias</span>
        </button>
      </div>

      <h1 style={styles.heading}>Nueva Materia</h1>

      <div style={styles.formContainer}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="codigo">Código</label>
            <input
              style={styles.input}
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: MAT101"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="nombre">Nombre</label>
            <input
              style={styles.input}
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Álgebra Lineal"
            />
          </div>

          <div style={styles.formGroupFullWidth}>
            <label style={styles.label} htmlFor="contenidos">Contenidos</label>
            <textarea
              style={styles.textarea}
              id="contenidos"
              name="contenidos"
              value={formData.contenidos}
              onChange={handleChange}
              placeholder="Ej: Matrices, Vectores, ..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="creditosOtorga">Créditos Otorga</label>
            <input
              style={styles.input}
              type="number"
              id="creditosOtorga"
              name="creditosOtorga"
              value={formData.creditosOtorga}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="creditosNecesarios">Créditos Necesarios</label>
            <input
              style={styles.input}
              type="number"
              id="creditosNecesarios"
              name="creditosNecesarios"
              value={formData.creditosNecesarios}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="tipo">Tipo</label>
            <select
              style={styles.select}
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="OBLIGATORIA">OBLIGATORIA</option>
              <option value="OPTATIVA">OPTATIVA</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Correlativas</label>
            <div style={styles.addCorrelativaContainer}>
              <input
                style={styles.addCorrelativaInput}
                type="text"
                value={newCorrelativa}
                onChange={(e) => setNewCorrelativa(e.target.value)}
                placeholder="Ej: MAT100"
              />
              <button 
                style={styles.addCorrelativaButton}
                type="button" 
                onClick={handleAddCorrelativa}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={styles.correlativasContainer}>
              {formData.correlativas.map((correlativa, index) => (
                <div key={index} style={styles.correlativaChip}>
                  <span>{correlativa}</span>
                  <button 
                    style={styles.correlativaRemoveButton}
                    type="button" 
                    onClick={() => handleRemoveCorrelativa(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.cancelButton}
            type="button" 
          >
            Cancelar
          </button>
          <button 
            style={styles.saveButton}
            type="button" 
            onClick={handleSubmit}
          >
            <span style={styles.saveButtonIcon}><Save size={16} /></span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaMateriaForm;