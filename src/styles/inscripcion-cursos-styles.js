export const inscripcionStyles = {
  // Header con fondo azul
  pageHeader: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  homeButton: {
    background: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  carreraSelect: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    minWidth: '200px',
  },

  // Tabs de navegación
  tabsContainer: {
    display: 'flex',
    background: '#F3F4F6',
    borderRadius: '8px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: '12px 24px',
    background: '#E5E7EB',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderRight: '1px solid #D1D5DB',
  },
  tabActive: {
    background: '#3B82F6',
    color: 'white',
    fontWeight: '600',
  },
  tabLast: {
    borderRight: 'none',
  },

  // Filtros
  filtersRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'flex-end',
  },
  filterGroup: {
    flex: '0 0 200px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  filterSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
  },
  searchGroup: {
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
  },

  // Tarjetas de curso
  cursoCard: {
    background: 'white',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s',
  },
  cursoCardHover: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderColor: '#3B82F6',
  },
  cursoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cursoTitleSection: {
    flex: 1,
  },
  cursoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1F2937',
    margin: '0 0 4px 0',
  },
  cursoSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  cursoRightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  creditosBadge: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
  },
  tipoBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  tipoBadgeObligatorio: {
    background: '#DBEAFE',
    color: '#1E40AF',
  },
  tipoBadgeOptativo: {
    background: '#F3E8FF',
    color: '#6B21A8',
  },

  // Detalles del curso
  cursoDetails: {
    fontSize: '14px',
    color: '#4B5563',
    marginBottom: '12px',
    lineHeight: '1.6',
  },
  cursoDetailRow: {
    marginBottom: '4px',
  },
  correlativasText: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '8px',
  },

  // Botón de inscribirse
  inscribirseButton: {
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  inscribirseButtonHover: {
    background: '#059669',
  },
  inscribirseButtonDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
  },

  // Estados de carga
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6B7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9CA3AF',
    fontSize: '16px',
  },

  // Paginación
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '32px',
    gap: '8px',
  },
  paginationButton: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  paginationButtonActive: {
    background: '#3B82F6',
    color: 'white',
    borderColor: '#3B82F6',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default inscripcionStyles;
