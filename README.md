# UPP Frontend

Frontend del sistema de gestión universitaria UPP (Universidad Politécnica del Plata). Interfaz web para administrar materias, inscripciones y consultar información académica.

## Tecnologías

- **React 19** con **Create React App**
- **Tailwind CSS v4** para estilos
- **Axios** para comunicación con API
- **JWT** para autenticación

## Cómo levantar la aplicación

### 1. Requisitos previos

- Node.js 16+
- npm 8+
- Backend UPP corriendo en `http://localhost:8080`

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```
REACT_APP_API_ENDPOINT=http://localhost:8080
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar

```bash
npm start
```

La aplicación se levanta en `http://localhost:3000`

## Estructura del código

```
src/
├── pages/          # Componentes de página
├── components/     # Componentes reutilizables
├── api/            # Configuración de Axios y endpoints
├── styles/         # Estilos centralizados
└── App.js          # Configuración de rutas
```

## Comunicacion con API

### Configuración base (`src/api/api.js`)

Instancia de Axios con:
- Base URL desde `REACT_APP_API_ENDPOINT`
- Interceptor automático que agrega JWT Bearer token en cada request
- Token de autenticacion almacenado en `localStorage` en la clave `authToken`

### Endpoints disponibles

- **`loginApi.js`**: Login y autenticación
- **`materiasApi.js`**: CRUD de materias
- **`alumnosApi.js`**: CRUD de alumnos + historia académica
- **`carrerasApi.js`**: CRUD de carreras
- **`planDeEstudiosApi.js`**: CRUD de planes de estudio
- **`cursosApi.js`**: CRUD de cursos + filtros por materia/plan
- **`cuatrimestresApi.js`**: CRUD de cuatrimestres
- **`inscripcionesApi.js`**: Inscripción a cursos + inscripciones del alumno
- **`actasApi.js`**: Gestión de actas y notas

## Autenticación

El sistema usa JWT almacenado en localStorage. El token se agrega automáticamente a todas las requests mediante un interceptor de Axios.

```javascript
// Ejemplo de uso desde el navegador
localStorage.getItem('authToken') // Ver token actual
```

## Arquitectura de estilos

- **Tailwind**: Utilidades para layout y componentes base
- **Style objects**: Estilos específicos de componentes en `src/styles/`

## Sistema de notificaciones

Hook personalizado `useNotification` para feedback al usuario en operaciones CRUD y manejo de errores.

## Roles del sistema

El frontend se adapta según el rol del usuario autenticado:

| Rol | Funcionalidades |
|-----|-----------------|
| ROLE_ALUMNO | Inscripción a cursos, consulta detalles de cursos, consulta de materias y consulta de historia académica |
| ROLE_DOCENTE | Gestión de actas y notas |
| ROLE_GESTION_ACADEMICA | ABM de materias, carreras y planes |
| ROLE_GESTION_ESTUDIANTIL | ABM de alumnos |
| ROLE_GESTOR_DE_PLANIFICACION | ABM de cursos y cuatrimestres |

## Rutas principales

(Rutas protegidas por rol [src/utils/roleUtils.js](src/utils/roleUtils.js)):

- **Login y acceso base**: `/login`, `/home`
- **Materias**: `/GestionMaterias`, `/CrearMateria`, `/EditarMateria/:codigoDeMateria`
- **Planes**: `/GestionPlanesDeEstudio`, `/CrearPlanDeEstudio`, `/EditarPlanDeEstudios/:codigo`
- **Carreras**: `/GestionCarreras`, `/CrearCarrera`, `/EditarCarrera/:codigo`
- **Alumnos**: `/GestionAlumnos`, `/CrearAlumno`, `/EditarAlumno/:matricula`
- **Cursos**: `/GestionCursos`, `/CrearCurso`, `/EditarCurso/:codigo`
- **Cuatrimestres**: `/GestionCuatrimestres`, `/CrearCuatrimestre`, `/EditarCuatrimestre/:codigo`
- **Inscripciones**: `/InscripcionCursos`, `/MisInscripciones`
- **Materias del plan**: `/MateriasDelPlan`
- **Mi carrera**: `/MiCarrera`
- **Historia académica**: `/HistoriaAcademica`
- **Actas**: `/GestionActas`, `/AbrirActa`, `/VerActa/:numeroCorrelativo`

## Cómo agregar páginas nuevas

### 1. Crear el componente de página
Crear archivo en [src/pages/](src/pages/) (ej: `NuevaPaginaPage.jsx`)

### 2. Agregar endpoints de API (si es necesario)
Crear o modificar archivo en [src/api/](src/api/) con los endpoints correspondientes

### 3. Registrar la ruta
En [src/App.js](src/App.js):
- Importar el componente
- Agregar `<Route path="/NuevaPagina" element={<NuevaPaginaPage />} />`

### 4. Configurar permisos por rol (si corresponde)
En [src/utils/roleUtils.js](src/utils/roleUtils.js):
- Agregar la ruta al array de rutas permitidas del rol correspondiente en `routePermissions`

### 5. Agregar enlace en navegación (opcional)
Si la página debe aparecer en el menú, agregar el enlace en el componente de navegación correspondiente
