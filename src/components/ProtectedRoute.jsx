import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessRoute, PUBLIC_ROUTES } from '../utils/roleUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si es una ruta pública, permitir acceso sin autenticación
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    return children;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene permisos para acceder a la ruta
  if (!canAccessRoute(user?.roles, location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo está bien, mostrar el contenido
  return children;
};

export default ProtectedRoute;