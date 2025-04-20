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
      <Link to="/">Home</Link>
      {user && user.username ? (
        <>
          <Link to="/maintenances/create">Nuevo Mantenimiento</Link>
          <span className="navbar-user">Hello, {user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;