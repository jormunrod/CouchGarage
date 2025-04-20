import React, { useState } from "react";
import "../styles/CreateMaintenance.css";
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const CreateMaintenance = () => {
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [customFields, setCustomFields] = useState([]); // [{key: '', value: ''}]
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const handleCustomFieldChange = (idx, field, value) => {
    const updated = customFields.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Construir el objeto con los campos estándar
    const maintenanceData = {
      carModel,
      date,
      description,
      cost,
    };
    // Agregar los campos personalizados (clave: valor)
    customFields.forEach(({ key, value }) => {
      if (key && value) {
        maintenanceData[key] = value;
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(maintenanceData),
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
      <div>
        <h4>Campos personalizados</h4>
        {customFields.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Nombre del campo (ej: color)"
              value={item.key}
              onChange={e => handleCustomFieldChange(idx, "key", e.target.value)}
            />
            <input
              type="text"
              placeholder="Valor (ej: rojo)"
              value={item.value}
              onChange={e => handleCustomFieldChange(idx, "value", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={handleAddField}>Agregar campo</button>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
      <button type="button" onClick={() => navigate('/')}>Volver</button>
    </form>
  );
};

export default CreateMaintenance;