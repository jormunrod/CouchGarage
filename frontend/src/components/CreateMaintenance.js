import React, { useState } from "react";
import "../styles/CreateMaintenance.css";
import { useNavigate } from 'react-router-dom';

const CreateMaintenance = ({ user }) => {
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/api/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          carModel,
          date,
          description,
          cost,
        }),
      });
  
      if (response.ok) {
        alert("¡Mantenimiento guardado!");
        navigate('/');
      } else {
        const data = await response.json();
        alert("Error al guardar: " + (data.error || "Desconocido"));
      }
    } catch (error) {
      alert("Error de red al guardar mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-maintenance-form" onSubmit={handleSubmit}>
      <h2>Nuevo Mantenimiento</h2>
      <label>
        Modelo de coche:
        <input
          type="text"
          value={carModel}
          onChange={e => setCarModel(e.target.value)}
          required
        />
      </label>
      <label>
        Fecha:
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </label>
      <label>
        Descripción:
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={3}
        />
      </label>
      <label>
        Coste (€):
        <input
          type="number"
          value={cost}
          min="0"
          step="0.01"
          onChange={e => setCost(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
      <button type="button" onClick={() => navigate('/')}>Volver</button>
    </form>
  );
};

export default CreateMaintenance;