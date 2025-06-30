import { useState } from 'react';
import { loginStyles } from '../styles/login-style';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import { postLogin } from '../api/loginApi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });
  
  const { notification, showNotification, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.dni || !formData.password) {
      showNotification('error', 'Por favor, complete todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await postLogin(
        {
          username: formData.dni,
          password: formData.password
        });

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      
      console.log('Login successful, token stored:', token);
      
      navigate('/GestionMaterias');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        showNotification('error', 'Credenciales inválidas');
      } else {
        showNotification('error', 'Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Recuperar contraseña clicked');
    
  };

  return (
    <div style={loginStyles.container}>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <div style={loginStyles.mainCard}>
        
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