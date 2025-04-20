import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirm, setPasswordConfirm] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
      }
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== password_confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        alert('Usuario registrado con éxito');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert('Error al registrar usuario');
    }
  };

  return (
    <div className="register-fullpage-bg">
      <form onSubmit={handleRegister} className="register-form">
        <h2>Registrarse</h2>
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
        <input
          type="password"
          placeholder="Repite la contraseña"
          value={password_confirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <button type="submit">Registrar</button>
        <button type="button" onClick={() => navigate('/')}>
          Volver
        </button>
        <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
      </form>
    </div>
  );
};

export default Register;