import { useState } from 'react';
import { loginStyles } from '../styles/login-style';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.dni || !formData.password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/auth/login`,
        {
          username: formData.dni,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      
      console.log('Login successful, token stored:', token);
      
      navigate('/GestionMaterias');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        setError('Credenciales inválidas');
      } else {
        setError('Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Recuperar contraseña clicked');
    // Handle forgot password
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.mainCard}>
        {/* Left Panel */}
        <div style={loginStyles.leftPanel}>
          <h1 style={loginStyles.welcomeTitle}>
            Bienvenido a la Universidad Politécnica del Plata
          </h1>
          
          <p style={loginStyles.subtitle}>
            Accedé a toda la información sobre tus estudios, inscripciones y trámites en un solo lugar.
          </p>
          
          <ul style={loginStyles.featureList}>
            <li style={loginStyles.featureItem}>
              <span style={loginStyles.checkIcon}>✓</span>
              Consultá tu historia académica y plan de estudios
            </li>
            <li style={loginStyles.featureItem}>
              <span style={loginStyles.checkIcon}>✓</span>
              Inscribite en cursos
            </li>
            <li style={loginStyles.featureItem}>
              <span style={loginStyles.checkIcon}>✓</span>
              Revisá tus facturas
            </li>
          </ul>
          
          <div style={loginStyles.buildingIcon}>
            🏛️
          </div>
        </div>

        {/* Right Panel */}
        <div style={loginStyles.rightPanel}>
          <h2 style={loginStyles.loginTitle}>INICIAR SESIÓN</h2>
          
          <div>
            <div style={loginStyles.formGroup}>
              <label style={loginStyles.label}>DNI</label>
              <input
                style={loginStyles.input}
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ingresar DNI"
              />
            </div>
            
            <div style={loginStyles.formGroup}>
              <label style={loginStyles.label}>Contraseña</label>
              <input
                style={loginStyles.input}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresar contraseña"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...loginStyles.loginButton,
                backgroundColor: loading ? '#9CA3AF' : loginStyles.loginButton.backgroundColor,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = loginStyles.loginButtonHover.backgroundColor;
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = loginStyles.loginButton.backgroundColor;
                }
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            
            {error && (
              <div style={loginStyles.errorMessage}>
                {error}
              </div>
            )}
          </div>
          
          <div style={loginStyles.forgotPassword}>
            <span 
              style={loginStyles.forgotPasswordLink}
              onClick={handleForgotPassword}
            >
              Recuperar contraseña
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;