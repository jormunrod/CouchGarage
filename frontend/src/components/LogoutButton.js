import React from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const LogoutButton = ({ fetchUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        alert("Logout successful");
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

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
