import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {styles} from '../styles/upp-style';
import {iconStyles} from '../styles/icon-styles';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { getActa, getNotasPorActa, agregarNota, actualizarNota, actualizarEstadoActa } from '../api/actasApi';
import { getErrorMessage } from '../utils/errorHandler';

const VerActaPage = () => {
  const { numeroCorrelativo } = useParams();
  const navigate = useNavigate();
  const [acta, setActa] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { notification, showNotification, closeNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
          showNotification('error', "No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
          return;
        }

        // Cargar acta
        const actaResponse = await getActa(numeroCorrelativo);
        setActa(actaResponse.data);

        // Cargar notas del acta
        const notasResponse = await getNotasPorActa(numeroCorrelativo);
        setNotas(notasResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = getErrorMessage(error, 'Error al cargar el acta');
        showNotification('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [numeroCorrelativo]);

  const handleNotaChange = (notaId, field, value) => {
    setNotas(prevNotas =>
      prevNotas.map(nota =>
        nota.id === notaId ? { ...nota, [field]: value } : nota
      )
    );
  };

  const handleGuardarCambios = async () => {
    try {
      // Actualizar cada nota modificada
      for (const nota of notas) {
        if (nota.id) {
          await actualizarNota(nota.id, {
            valor: parseInt(nota.valor) || 0,
            alumnoId: nota.alumnoId,
            numeroCorrelativoActa: parseInt(numeroCorrelativo)
          });
        }
      }

      showNotification('success', 'Cambios guardados exitosamente');

      // Recargar notas
      const notasResponse = await getNotasPorActa(numeroCorrelativo);
      setNotas(notasResponse.data);
    } catch (error) {
      console.error('Error saving changes:', error);
      const errorMessage = getErrorMessage(error, 'Error al guardar los cambios');
      showNotification('error', errorMessage);
    }
  };

  const handleCerrarActa = async () => {
    try {
      await actualizarEstadoActa(numeroCorrelativo, { estado: 'CERRADA' });
      showNotification('success', 'Acta cerrada exitosamente');

      // Actualizar estado local
      setActa(prev => ({ ...prev, estado: 'CERRADA' }));
    } catch (error) {
      console.error('Error closing acta:', error);
      const errorMessage = getErrorMessage(error, 'Error al cerrar el acta');
      showNotification('error', errorMessage);
    }
  };

  const getEstadoNota = (valor) => {
    if (!valor || valor === '') return '-';

    const nota = parseInt(valor);
    if (isNaN(nota)) return '-';

    // Para actas de final/promoción
    if (acta?.tipoDeActa === 'FINAL' || acta?.tipoDeActa === 'CURSADA') {
      return nota >= 4 ? 'Aprobado' : 'Desaprobado';
    }

    // Para cursada
    if (acta?.tipoDeActa === 'CURSADA') {
      return nota >= 4 ? 'Aprobado' : 'Desaprobado';
    }

    return '-';
  };

  const filteredNotas = notas.filter(nota =>
    searchTerm === '' ||
    nota.matriculaAlumno?.toString().includes(searchTerm) ||
    nota.nombreAlumno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.apellidoAlumno?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>Cargando acta...</div>
      </div>
    );
  }

  if (!acta) {
    return (
      <div style={styles.container}>
        <div>No se encontró el acta</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <div style={styles.header}>
        <button style={styles.headerButton} onClick={() => navigate('/GestionActas')}>
          <span style={iconStyles.arrowLeft}>←</span>
          <span style={styles.headerButtonText}>Volver a Gestión de Actas</span>
        </button>
      </div>

      <h1 style={styles.heading}>
        Carga de Notas de {acta.tipoDeActa === 'FINAL' ? 'Final' : 'Cursada'}
      </h1>

      <div style={{
        ...styles.formContainer,
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <strong>Número Correlativo:</strong> {acta.numeroCorrelativo}
          </div>
          <div>
            <strong>Tipo de Acta:</strong>{' '}
            <span style={
              acta.tipoDeActa === 'FINAL' ? styles.badgeObligatoria :
              acta.tipoDeActa === 'CURSADA' ? styles.badgeOptativa :
              styles.correlativaChip
            }>
              {acta.tipoDeActa}
            </span>
          </div>
          <div>
            <strong>Estado:</strong>{' '}
            <span style={acta.estado === 'ABIERTA' ? styles.statusActive : styles.statusInactive}>
              {acta.estado}
            </span>
          </div>
        </div>
        <div>
          <strong>Curso:</strong> {acta.codigoCurso}
        </div>
      </div>

      {acta.tipoDeActa === 'FINAL' && (
        <div style={{
          padding: '12px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            La nota final es el resultado del examen integrador, se puede rendir hasta dos veces por cuatrimestre.
          </p>
          <p style={{ margin: '0' }}>
            <strong>Requisito de aprobación:</strong> Nota igual o mayor a 4.
          </p>
        </div>
      )}

      <div style={styles.formContainer}>
        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>Buscar Alumno</label>
          <input
            type="text"
            placeholder="Nombre, apellido o matrícula..."
            style={{...styles.searchInput, width: '100%', maxWidth: '400px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeadCell}>Matrícula</th>
                <th style={styles.tableHeadCell}>Apellido y Nombre</th>
                <th style={styles.tableHeadCell}>
                  {acta.tipoDeActa === 'FINAL' ? 'Nota Examen Integrador' :
                   acta.tipoDeActa === 'CURSADA' ? 'Nota Cursada' :
                   'Nota Final'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNotas.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{...styles.tableCell, textAlign: 'center', padding: '24px'}}>
                    No hay alumnos inscriptos en este acta
                  </td>
                </tr>
              ) : (
                filteredNotas.map(nota => (
                  <tr key={nota.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{nota.matriculaAlumno}</td>
                    <td style={styles.tableCell}>{nota.apellidoAlumno}, {nota.nombreAlumno}</td>
                    <td style={styles.tableCell}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={nota.valor || ''}
                        onChange={(e) => handleNotaChange(nota.id, 'valor', e.target.value)}
                        disabled={acta.estado === 'CERRADA'}
                        style={{
                          ...styles.input,
                          width: '80px',
                          opacity: acta.estado === 'CERRADA' ? 0.6 : 1
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {acta.estado === 'ABIERTA' && (
          <div style={{...styles.buttonGroup, marginTop: '24px'}}>
            <button
              onClick={handleGuardarCambios}
              style={styles.saveButton}
              type="button"
            >
              <span style={styles.saveButtonIcon}>
                <span style={iconStyles.save}>💾</span>
              </span>
              Guardar Cambios
            </button>
            <button
              onClick={handleCerrarActa}
              style={{
                background: '#EF4444',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '8px'
              }}
              type="button"
            >
              Cerrar Acta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerActaPage;
