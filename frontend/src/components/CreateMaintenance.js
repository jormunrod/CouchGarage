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

  // Cuando el backend esté listo, aquí se hará el fetch real
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de guardado
    setTimeout(() => {
      alert("¡(Simulado) Mantenimiento guardado!");
      setLoading(false);
      navigate('/');
    }, 800);
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