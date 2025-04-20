import React from "react";
import { Link } from "react-router-dom";
import car from "../assets/images/logo.png";
import "../styles/Home.css";

const Home = ({ user }) => (
  <div className="home-fullpage-bg">
    <div className="home-card">
      <img src={car} className="home-logo" alt="logo" />
      <h1 className="home-title">CouchGarage</h1>
      <p className="home-subtitle">
        Organiza y lleva el control de tus mantenimientos de coche, fácil y
        rápido.
      </p>
      {user ? (
        <div className="home-actions">
          <p className="home-welcome">¡Has iniciado sesión, {user.username}!</p>
          <Link to="/maintenances/mine" className="home-btn">
            Ver mis mantenimientos
          </Link>
          <Link to="/maintenances/create" className="home-btn secondary">
            Añadir mantenimiento
          </Link>
        </div>
      ) : (
        <div className="home-actions">
          <Link to="/login" className="home-btn">
            Iniciar sesión
          </Link>
          <Link to="/register" className="home-btn secondary">
            Registrarse
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default Home;
