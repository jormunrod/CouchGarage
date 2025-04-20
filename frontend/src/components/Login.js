import React, { useState } from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Login = ({ fetchUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        await fetchUser();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div className="login-fullpage-bg">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar sesión</button>
        <button type="button" onClick={() => navigate('/')}>
          Volver
        </button>
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
};

export default Login;