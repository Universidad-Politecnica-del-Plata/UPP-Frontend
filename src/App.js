import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MateriasPage from "./pages/MateriasPage.jsx";
import CrearMateriaPage from "./pages/CrearMateriaPage.jsx";
import EditarMateriaPage from "./pages/EditarMateriasPage.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={"home"} />
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
