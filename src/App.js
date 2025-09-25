import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              {"home"}
            </ProtectedRoute>
          } />
          
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route path="/GestionMaterias" element={
            <ProtectedRoute>
              <MateriasPage />
            </ProtectedRoute>
          } />
          
          <Route path="/CrearMateria" element={
            <ProtectedRoute>
              <CrearMateriaPage />
            </ProtectedRoute>
          } />
          
          <Route path="/EditarMateria/:codigoDeMateria" element={
            <ProtectedRoute>
              <EditarMateriaPage />
            </ProtectedRoute>
          } />
          
          <Route path="/GestionPlanesDeEstudio" element={
            <ProtectedRoute>
              <PlanesDeEstudioPage />
            </ProtectedRoute>
          } />
          
          <Route path="/CrearPlanDeEstudio" element={
            <ProtectedRoute>
              <CrearPlanDeEstudiosPage />
            </ProtectedRoute>
          } />
          
          <Route path="/EditarPlanDeEstudios/:codigo" element={
            <ProtectedRoute>
              <EditarPlanesDeEstudioPage />
            </ProtectedRoute>
          } />
          
          <Route path="/GestionCarreras" element={
            <ProtectedRoute>
              <CarrerasPage />
            </ProtectedRoute>
          } />
          
          <Route path="/CrearCarrera" element={
            <ProtectedRoute>
              <CrearCarreraPage />
            </ProtectedRoute>
          } />
          
          <Route path="/EditarCarrera/:codigo" element={
            <ProtectedRoute>
              <EditarCarrerasPage />
            </ProtectedRoute>
          } />
          
          <Route path="/GestionAlumnos" element={
            <ProtectedRoute>
              <AlumnosPage />
            </ProtectedRoute>
          } />
          
          <Route path="/CrearAlumno" element={
            <ProtectedRoute>
              <CrearAlumno />
            </ProtectedRoute>
          } />
          
          <Route path="/EditarAlumno/:matricula" element={
            <ProtectedRoute>
              <EditarAlumnoPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
