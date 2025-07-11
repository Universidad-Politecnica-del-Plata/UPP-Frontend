import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import MateriasPage from "./pages/MateriasPage.jsx";
import CrearMateriaPage from "./pages/CrearMateriaPage.jsx";
import EditarMateriaPage from "./pages/EditarMateriasPage.jsx";
import PlanesDeEstudioPage from "./pages/PlanesDeEstudioPage.jsx";
import CrearPlanDeEstudiosPage from "./pages/CrearPlanDeEstudiosPage.jsx";

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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
