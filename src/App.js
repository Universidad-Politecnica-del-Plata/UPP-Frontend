import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import MateriasPage from "./pages/MateriasPage.jsx";
import CrearMateriaPage from "./pages/CrearMateriaPage.jsx";
import EditarMateriaPage from "./pages/EditarMateriasPage.jsx";
import PlanesDeEstudioPage from "./pages/PlanesDeEstudioPage.jsx";
import CrearPlanDeEstudiosPage from "./pages/CrearPlanDeEstudiosPage.jsx";
import EditarPlanesDeEstudioPage from "./pages/EditarPlanesDeEstudioPage.jsx";
import CarrerasPage from "./pages/CarrerasPage.jsx";
import CrearCarreraPage from "./pages/CrearCarreraPage.jsx";
import EditarCarrerasPage from "./pages/EditarCarrerasPage.jsx";
import AlumnosPage from "./pages/AlumnosPage.jsx";
import CrearAlumno from "./pages/CrearAlumnoPage.jsx";
import EditarAlumnoPage from "./pages/EditarAlumnoPage.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={"home"} />
          </Route>
          <Route path="/login">
            <Route index element={<LoginPage/>} />
          </Route>
          <Route path="/GestionMaterias">
            <Route index element={<MateriasPage />} />
          </Route>
          <Route path="/CrearMateria">
            <Route index element={<CrearMateriaPage />} />
          </Route>
          <Route
            path="/EditarMateria/:codigoDeMateria"
            element={<EditarMateriaPage />}
          />
          <Route path="/GestionPlanesDeEstudio">
            <Route index element={<PlanesDeEstudioPage />} />
          </Route>
          <Route path="/CrearPlanDeEstudio">
            <Route index element={<CrearPlanDeEstudiosPage />} />
          </Route>
          <Route
            path="/EditarPlanDeEstudios/:codigo"
            element={<EditarPlanesDeEstudioPage />}
          />
          <Route path="/GestionCarreras">
            <Route index element={<CarrerasPage />} />
          </Route>
          <Route path="/CrearCarrera">
            <Route index element={<CrearCarreraPage />} />
          </Route>
          <Route
            path="/EditarCarrera/:codigo"
            element={<EditarCarrerasPage />}
          />
          <Route path="/GestionAlumnos">
            <Route index element={<AlumnosPage />} />
          </Route>
          <Route
            path="/CrearAlumno"
            element={<CrearAlumno />}
          />
          <Route
            path="/EditarAlumno/:matricula"
            element={<EditarAlumnoPage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
