import React, { useEffect, useState } from "react";
import "../styles/UserMaintenances.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const UserMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenances = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/maintenance/mine`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setMaintenances(data);
        } else {
          setMaintenances([]);
        }
      } catch (error) {
        setMaintenances([]);
      }
      setLoading(false);
    };
    fetchMaintenances();
  }, []);

  if (loading) return <div className="user-mt-loading">Cargando mantenimientos...</div>;
  if (!maintenances.length) return <div className="user-mt-empty">No hay mantenimientos registrados.</div>;

  return (
    <div className="user-mt-container">
      <h2>Mis Mantenimientos</h2>
      <div className="user-mt-list">
        {maintenances.map((item) => (
          <div key={item._id} className="user-mt-card">
            <div><strong>Modelo:</strong> {item.carModel}</div>
            <div><strong>Fecha:</strong> {item.date}</div>
            <div><strong>Descripción:</strong> {item.description}</div>
            <div><strong>Coste:</strong> {item.cost} €</div>
            {/* Mostrar campos personalizados */}
            {Object.entries(item).map(([key, value]) =>
              !["carModel", "date", "description", "cost", "userId", "createdAt", "_id", "_rev"].includes(key) ? (
                <div key={key}><strong>{key}:</strong> {value}</div>
              ) : null
            )}
            <div className="user-mt-date">
              <em>Creado: {new Date(item.createdAt).toLocaleString()}</em>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserMaintenances;