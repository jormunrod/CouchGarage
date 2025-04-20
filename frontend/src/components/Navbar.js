import React from "react";
import { Link, useNavigate } from "react-router-dom";
import car from "../assets/images/logo.png";
import "../styles/Navbar.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const Navbar = ({ user, fetchUser, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        await fetchUser();
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ""}`);
      }
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo-area" onClick={() => navigate("/")}>
        <img src={car} alt="CouchGarage logo" className="navbar-logo" />
        <span className="navbar-brand">CouchGarage</span>
      </div>
      <div className="navbar-links">
        {user && user.username ? (
          <>
            <Link to="/maintenances/create">Nuevo Mantenimiento</Link>
            <Link to="/maintenances/mine">Mis Mantenimientos</Link>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
        <Link to="/about">Sobre nosotros</Link>
      </div>
      <div className="navbar-actions">
        {user && user.username ? (
          <>
            <span className="navbar-user">Hola, {user.username}</span>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
