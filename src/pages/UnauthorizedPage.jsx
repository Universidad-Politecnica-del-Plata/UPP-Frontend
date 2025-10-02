import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Intentar volver a la página anterior, o ir a una página por defecto
    navigate(-1);
  };

  const handleGoHome = () => {
    // Redirigir a una página por defecto según el rol del usuario
    if (user?.roles?.includes('ROLE_GESTION_ACADEMICA')) {
      navigate('/GestionMaterias');
    } else if (user?.roles?.includes('ROLE_GESTION_ESTUDIANTIL')) {
      navigate('/GestionAlumnos');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        <p className="text-gray-600 mb-8">
          Usted no tiene permisos para acceder a esta página. 
          Contacte al administrador si considera que esto es un error.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Volver Atrás
          </button>

          <button
            onClick={handleGoHome}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>

        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Usuario: {user.username}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Roles: {user.roles?.join(', ') || 'Sin roles asignados'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;