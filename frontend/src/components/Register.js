import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        alert('Usuario registrado con éxito');
        navigate('/login'); // Ir a la página de login tras registrar
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert('Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoFocus
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      <button type="button" onClick={() => navigate('/')}>
        Back
      </button>
    </form>
  );
};

export default Register;