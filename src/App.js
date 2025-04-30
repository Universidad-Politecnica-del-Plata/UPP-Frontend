import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MateriasPage from "./pages/MateriasPage.jsx";
import CrearMateriaPage from "./pages/CrearMateriaPage.jsx";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<MateriasPage />} />
          </Route>
          <Route path="/CrearMateria">
            <Route index element={<CrearMateriaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
