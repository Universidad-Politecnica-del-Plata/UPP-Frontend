// Definición de permisos por rol para cada página
export const ROLE_PERMISSIONS = {
  '/GestionMaterias': ['ROLE_GESTION_ACADEMICA'],
  '/CrearMateria': ['ROLE_GESTION_ACADEMICA'],
  '/EditarMateria': ['ROLE_GESTION_ACADEMICA'],
  '/GestionAlumnos': ['ROLE_GESTION_ESTUDIANTIL'],
  '/CrearAlumno': ['ROLE_GESTION_ESTUDIANTIL'],
  '/EditarAlumno': ['ROLE_GESTION_ESTUDIANTIL'],
  '/GestionCarreras': ['ROLE_GESTION_ACADEMICA'],
  '/CrearCarrera': ['ROLE_GESTION_ACADEMICA'],
  '/EditarCarrera': ['ROLE_GESTION_ACADEMICA'],
  '/GestionPlanesDeEstudio': ['ROLE_GESTION_ACADEMICA'],
  '/CrearPlanDeEstudio': ['ROLE_GESTION_ACADEMICA'],
  '/EditarPlanDeEstudios': ['ROLE_GESTION_ACADEMICA'],
  '/GestionCursos': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/CrearCurso': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/EditarCurso': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/GestionCuatrimestres': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/CrearCuatrimestre': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/EditarCuatrimestre': ['ROLE_GESTOR_DE_PLANIFICACION'],
  '/InscripcionCursos': ['ROLE_ALUMNO'],
  '/MisInscripciones': ['ROLE_ALUMNO'],
  '/GestionActas': ['ROLE_DOCENTE'],
  '/AbrirActa': ['ROLE_DOCENTE'],
  '/VerActa': ['ROLE_DOCENTE'],
  '/home': ['ROLE_ALUMNO', 'ROLE_DOCENTE', 'ROLE_GESTION_ACADEMICA', 'ROLE_GESTION_ESTUDIANTIL', 'ROLE_GESTOR_DE_PLANIFICACION'],
};

// Rutas públicas que no requieren autenticación
export const PUBLIC_ROUTES = ['/login', '/'];

// Verificar si un usuario tiene permisos para acceder a una ruta
export const canAccessRoute = (userRoles, route) => {
  // Si es una ruta pública, permitir acceso
  if (PUBLIC_ROUTES.includes(route)) {
    return true;
  }

  // Primero intentar una coincidencia exacta
  let requiredRoles = ROLE_PERMISSIONS[route];
  
  // Si no hay coincidencia exacta, buscar coincidencia por patrón
  if (!requiredRoles) {
    for (const [routePattern, roles] of Object.entries(ROLE_PERMISSIONS)) {
      // Verificar si la ruta actual coincide con el patrón base
      // Ej: /EditarCarrera/123 coincide con /EditarCarrera
      if (route.startsWith(routePattern + '/') || route === routePattern) {
        requiredRoles = roles;
        break;
      }
    }
  }

  // Si no hay roles definidos para la ruta, denegar acceso por defecto
  if (!requiredRoles) {
    return false;
  }

  // Verificar si el usuario tiene al menos uno de los roles requeridos
  return userRoles && requiredRoles.some(role => userRoles.includes(role));
};

// Obtener las rutas disponibles para un usuario según sus roles
export const getAvailableRoutes = (userRoles) => {
  if (!userRoles) return PUBLIC_ROUTES;

  const availableRoutes = PUBLIC_ROUTES.slice(); // Copiar rutas públicas

  Object.entries(ROLE_PERMISSIONS).forEach(([route, requiredRoles]) => {
    if (requiredRoles.some(role => userRoles.includes(role))) {
      availableRoutes.push(route);
    }
  });

  return availableRoutes;
};