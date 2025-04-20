import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ user, setView, setUser, fetchUser }) => {
  const handleLogout = async () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        await fetchUser();
        setView("home");
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
      <button onClick={() => setView('home')}>Home</button>
      {user && user.username ? (
        <>
          <span className="navbar-user">Hello, {user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => setView('login')}>Login</button>
          <button onClick={() => setView('register')}>Register</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;