export const getErrorMessage = (error, defaultMessage = 'Ocurrio un error') => {
  // Errores de autenticacion
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

  const backendMessage = error.response?.data?.error;
  if (backendMessage) {
    return backendMessage;
  }

  const altMessage = error.response?.data?.message;
  if (altMessage) {
    return altMessage;
  }

  return defaultMessage;
};