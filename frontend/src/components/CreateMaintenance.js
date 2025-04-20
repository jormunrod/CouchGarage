import React, { useState } from "react";
import "../styles/CreateMaintenance.css";
import { useNavigate } from "react-router-dom";
import Message from "../components/Message";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const CreateMaintenance = () => {
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
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

  const handleRemoveField = (idx) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const maintenanceData = {
      carModel,
      date,
      description,
      cost,
    };
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
        setMessage({
          type: "success",
          text: "¡Mantenimiento guardado! Redirigiendo...",
        });
        setTimeout(() => navigate("/"), 1200);
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: "Error al guardar: " + (data.error || "Desconocido"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error de red al guardar mantenimiento",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-mt-fullpage-bg">
      <form className="create-maintenance-form" onSubmit={handleSubmit}>
        <h2>
          <span role="img" aria-label="tools">
            🛠️
          </span>{" "}
          Nuevo Mantenimiento
        </h2>
        {message && (
          <Message type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Message>
        )}
        <div className="inputs-wrapper">
          <div className="input-group">
            <label htmlFor="carModel">
              <span className="icon">🚗</span> Modelo de coche
            </label>
            <input
              id="carModel"
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              required
              autoComplete="off"
              placeholder="Ej: Toyota Corolla"
            />
          </div>
          <div className="input-group">
            <label htmlFor="date">
              <span className="icon">📅</span> Fecha
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">
              <span className="icon">📝</span> Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe el mantenimiento realizado"
            />
          </div>
          <div className="input-group">
            <label htmlFor="cost">
              <span className="icon">💶</span> Coste (€)
            </label>
            <input
              id="cost"
              type="number"
              value={cost}
              min="0"
              step="0.01"
              onChange={(e) => setCost(e.target.value)}
              required
              placeholder="Ej: 200"
            />
          </div>
        </div>
        <div className="custom-fields-section">
          <div className="custom-fields-header">
            <h4>Campos personalizados</h4>
            <button
              type="button"
              className="add-field-btn"
              onClick={handleAddField}
              title="Agregar campo personalizado"
            >
              <span className="icon">➕</span> Agregar campo
            </button>
          </div>
          {customFields.length === 0 && (
            <div className="custom-fields-empty">
              Agrega información personalizada como <b>kilometraje</b>,{" "}
              <b>taller</b>, etc.
            </div>
          )}
          {customFields.map((item, idx) => (
            <div key={idx} className="custom-field-row">
              <input
                type="text"
                placeholder="Nombre del campo (ej: kilometraje)"
                value={item.key}
                onChange={(e) =>
                  handleCustomFieldChange(idx, "key", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Valor (ej: 123456)"
                value={item.value}
                onChange={(e) =>
                  handleCustomFieldChange(idx, "value", e.target.value)
                }
              />
              <button
                type="button"
                className="remove-field-btn"
                title="Eliminar campo"
                aria-label="Eliminar campo"
                onClick={() => handleRemoveField(idx)}
              >
                <span className="icon">🗑️</span>
              </button>
            </div>
          ))}
        </div>
        <div className="form-btns-row">
          <button type="submit" className="main-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loader"></span> Guardando...
              </>
            ) : (
              <>
                <span className="icon">💾</span> Guardar
              </>
            )}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            <span className="icon">←</span> Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMaintenance;
