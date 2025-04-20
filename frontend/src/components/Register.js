import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import Message from "../components/Message";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!username || !password) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }
    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    if (password !== password_confirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setMessage({
          type: "success",
          text: "Usuario registrado con éxito. Redirigiendo al login...",
        });
        setTimeout(() => navigate("/login"), 1200);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: `Error: ${errorData.error} - ${errorData.details || ""}`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al registrar usuario" });
    }
  };

  return (
    <div className="register-fullpage-bg">
      <form onSubmit={handleRegister} className="register-form">
        <h2>Registrarse</h2>
        {message && (
          <Message type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Message>
        )}
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
        <button type="button" onClick={() => navigate("/")}>
          Volver
        </button>
        <p>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
