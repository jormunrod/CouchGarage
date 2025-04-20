import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Navbar = ({ user, fetchUser, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        await fetchUser();
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">Inicio</Link>
      {user && user.username ? (
        <>
          <Link to="/maintenances/create">Nuevo Mantenimiento</Link>
          <Link to="/maintenances/mine">Mis Mantenimientos</Link>
          <span className="navbar-user">Hola, {user.username}</span>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Registrarse</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;