import React, { createContext, useContext, useState, useEffect } from 'react';

const PlanDeEstudiosContext = createContext();

export const PlanDeEstudiosProvider = ({ children }) => {
  const [planSeleccionado, setPlanSeleccionadoState] = useState(() => {
    return localStorage.getItem('planSeleccionado') || '';
  });

  const setPlanSeleccionado = (plan) => {
    setPlanSeleccionadoState(plan);
    if (plan) {
      localStorage.setItem('planSeleccionado', plan);
    } else {
      localStorage.removeItem('planSeleccionado');
    }
  };

  const value = {
    planSeleccionado,
    setPlanSeleccionado,
  };

  return (
    <PlanDeEstudiosContext.Provider value={value}>
      {children}
    </PlanDeEstudiosContext.Provider>
  );
};

export const usePlanDeEstudios = () => {
  const context = useContext(PlanDeEstudiosContext);
  if (!context) {
    throw new Error('usePlanDeEstudios debe ser usado dentro de PlanDeEstudiosProvider');
  }
  return context;
};
