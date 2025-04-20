import React, { useEffect, useState } from "react";
import "../styles/UserMaintenances.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Diccionario para traducir claves de mantenimiento a español
const FIELD_LABELS = {
  _id: "ID",
  carModel: "Modelo",
  date: "Fecha",
  description: "Descripción",
  cost: "Coste",
  createdAt: "Fecha de creación",
  updatedAt: "Última modificación",
  owner: "Propietario",
  propietario: "Propietario",
  propietarioNombre: "Propietario",
  // Añade aquí otros campos personalizados si los tienes
};

const UserMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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
              <div
                key={item._id}
                className="user-mt-maint-card"
                tabIndex={0}
                onClick={() => setSelected(item)}
                onKeyDown={(e) => { if (e.key === "Enter") setSelected(item); }}
                role="button"
                aria-label={`Ver detalles de mantenimiento ${item.carModel}`}
              >
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
                <div className="user-mt-date">
                  <em>Creado: {new Date(item.createdAt).toLocaleString("es-ES")}</em>
                </div>
                {item.propietario || item.owner || item.propietarioNombre ? (
                  <div>
                    <strong>Propietario:</strong> <span>
                      {item.propietario || item.owner || item.propietarioNombre}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <MaintenanceModal
          maintenance={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

function MaintenanceModal({ maintenance, onClose }) {
  // Deshabilitamos scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Mapeamos los campos a mostrar y su traducción
  const camposMostrar = Object.entries(maintenance).filter(
    ([key]) => !["userId", "_rev"].includes(key)
  );

  return (
    <div className="mt-modal-overlay" onClick={onClose}>
      <div className="mt-modal" onClick={e => e.stopPropagation()} tabIndex={-1}>
        <button className="mt-modal-close" onClick={onClose} title="Cerrar">×</button>
        <h3>Detalle de Mantenimiento</h3>
        <div className="mt-modal-details">
          {camposMostrar.map(([key, value]) => {
            let label = FIELD_LABELS[key] || key;
            let displayValue = value;

            // Formatea fechas automáticamente
            if (key === "createdAt" || key === "updatedAt" || key === "date") {
              try {
                displayValue = new Date(value).toLocaleString("es-ES", key === "date"
                  ? { dateStyle: "long" }
                  : { dateStyle: "long", timeStyle: "short" }
                );
              } catch (e) { /* Si falla, muestra el valor original */ }
            }
            if (key === "cost") {
              displayValue = `${value} €`;
            }

            return (
              <div key={key} className="mt-modal-detail-row">
                <strong>{label}:</strong> <span>{displayValue}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-modal-actions">
          <button className="mt-modal-edit" disabled>Editar</button>
          <button className="mt-modal-delete" disabled>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default UserMaintenances;