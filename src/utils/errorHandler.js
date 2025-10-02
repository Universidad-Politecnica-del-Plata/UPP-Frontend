export const getErrorMessage = (error, defaultMessage = 'Ocurrio un error') => {
  // Para errores de autenticación, mantener mensajes específicos
  if (error.response?.status === 401) {
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/') {
      return 'Credenciales inválidas';
    }
    return 'Sesión expirada. Por favor, inicie sesión nuevamente.';
  }

  if (error.response?.status === 403) {
    return 'No tiene permisos para acceder a esta información.';
  }

  // Intentar extraer mensaje del backend (formato: { error: "mensaje" })
  const backendMessage = error.response?.data?.error;
  if (backendMessage) {
    return backendMessage;
  }

  // Fallback para otros formatos de mensaje del backend
  const altMessage = error.response?.data?.message;
  if (altMessage) {
    return altMessage;
  }

  // Fallback final
  return defaultMessage;
};