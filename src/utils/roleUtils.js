// Permisos por rol
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
  '/MateriasDelPlan': ['ROLE_ALUMNO'],
  '/MiCarrera': ['ROLE_ALUMNO'],
  '/HistoriaAcademica': ['ROLE_ALUMNO'],
  '/home': ['ROLE_ALUMNO', 'ROLE_DOCENTE', 'ROLE_GESTION_ACADEMICA', 'ROLE_GESTION_ESTUDIANTIL', 'ROLE_GESTOR_DE_PLANIFICACION'],
};

// Rutas sin requisito de autenticacion
export const PUBLIC_ROUTES = ['/login', '/'];

export const canAccessRoute = (userRoles, route) => {
  if (PUBLIC_ROUTES.includes(route)) {
    return true;
  }

  let requiredRoles = ROLE_PERMISSIONS[route];

  // Si no hay match exacto, busco por patron (ej: /EditarCarrera/123)
  if (!requiredRoles) {
    for (const [routePattern, roles] of Object.entries(ROLE_PERMISSIONS)) {
      if (route.startsWith(routePattern + '/') || route === routePattern) {
        requiredRoles = roles;
        break;
      }
    }
  }

  if (!requiredRoles) {
    return false;
  }

  return userRoles && requiredRoles.some(role => userRoles.includes(role));
};

export const getAvailableRoutes = (userRoles) => {
  if (!userRoles) return PUBLIC_ROUTES;

  const availableRoutes = PUBLIC_ROUTES.slice();

  Object.entries(ROLE_PERMISSIONS).forEach(([route, requiredRoles]) => {
    if (requiredRoles.some(role => userRoles.includes(role))) {
      availableRoutes.push(route);
    }
  });

  return availableRoutes;
};