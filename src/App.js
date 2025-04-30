import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MateriasPage from "./pages/MateriasPage.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<MateriasPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
