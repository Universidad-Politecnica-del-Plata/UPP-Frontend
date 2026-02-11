import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        
        // Verificar si el token no esta expirado
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('authToken');
          setUser(null);
        } else {
          setUser({
            username: decodedToken.sub,
            roles: decodedToken.roles || [],
            token: token
          });
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      localStorage.setItem('authToken', token);
      setUser({
        username: decodedToken.sub,
        roles: decodedToken.roles || [],
        token: token
      });
      return true;
    } catch (error) {
      console.error('Error al hacer login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const hasRole = (requiredRole) => {
    return user?.roles?.includes(requiredRole) || false;
  };

  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some(role => hasRole(role));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};