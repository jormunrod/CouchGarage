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

  return (
    <div className="user-mt-fullpage-bg">
      <div className="user-mt-card">
        <h2>Mis Mantenimientos</h2>
        {loading ? (
          <div className="user-mt-loading">Cargando mantenimientos...</div>
        ) : !maintenances.length ? (
          <div className="user-mt-empty">No hay mantenimientos registrados.</div>
        ) : (
          <div className="user-mt-list">
            {maintenances.map((item) => (
              <div key={item._id} className="user-mt-maint-card">
                <div>
                  <strong>Modelo:</strong> <span>{item.carModel}</span>
                </div>
                <div>
                  <strong>Fecha:</strong> <span>{item.date}</span>
                </div>
                <div>
                  <strong>Descripción:</strong> <span>{item.description}</span>
                </div>
                <div>
                  <strong>Coste:</strong> <span>{item.cost} €</span>
                </div>
                {/* Mostrar campos personalizados */}
                {Object.entries(item).map(([key, value]) =>
                  !["carModel", "date", "description", "cost", "userId", "createdAt", "_id", "_rev"].includes(key) ? (
                    <div key={key}>
                      <strong>{key}:</strong> <span>{value}</span>
                    </div>
                  ) : null
                )}
                <div className="user-mt-date">
                  <em>Creado: {new Date(item.createdAt).toLocaleString()}</em>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMaintenances;