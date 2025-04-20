import React, { useEffect, useState } from "react";
import "../styles/UserMaintenances.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

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
};

// Campos que NO se deben editar
const NON_EDITABLE_FIELDS = [
  "_id", "createdAt", "updatedAt", "userId", "_rev", "owner", "propietario", "propietarioNombre"
];

const UserMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(false);

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
  }, [refresh]);

  const handleUpdate = () => {
    setSelected(null);
    setRefresh((r) => !r); // Fuerza recarga de mantenimientos
  };

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
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <MaintenanceModal
          maintenance={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdate}
        />
      )}
    </div>
  );
};

function MaintenanceModal({ maintenance, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Inicializa el formulario con todos los campos editables, incluidos personalizados
  useEffect(() => {
    if (editing) {
      const editable = Object.keys(maintenance)
        .filter(key => !NON_EDITABLE_FIELDS.includes(key));
      const initialForm = {};
      editable.forEach(key => {
        initialForm[key] = maintenance[key] ?? "";
      });
      setForm(initialForm);
      setError("");
      setSaving(false);
    }
  }, [editing, maintenance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Validación básica: campos requeridos
    const required = ["carModel", "date", "description", "cost"];
    const missing = required.filter(field => !form[field]);
    if (missing.length) {
      setError("Por favor, completa todos los campos obligatorios.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/maintenance/${maintenance._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setEditing(false);
        onUpdated(await response.json());
      } else {
        const data = await response.json();
        setError(data.error || "Error al actualizar");
      }
    } catch (e) {
      setError("Error al actualizar");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este mantenimiento?")) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/maintenance/${maintenance._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        onUpdated();
      } else {
        const data = await response.json();
        setError(data.error || "Error al eliminar");
      }
    } catch (e) {
      setError("Error al eliminar");
    }
    setDeleting(false);
  };

  // Campos a mostrar (todos menos los no editables)
  const camposMostrar = Object.entries(maintenance).filter(
    ([key]) => !["userId", "_rev"].includes(key)
  );

  return (
    <div className="mt-modal-overlay" onClick={onClose}>
      <div className="mt-modal" onClick={e => e.stopPropagation()} tabIndex={-1}>
        <button className="mt-modal-close" onClick={onClose} title="Cerrar">×</button>
        <h3>Detalle de Mantenimiento</h3>
        {!editing ? (
          <>
            <div className="mt-modal-details">
              {camposMostrar.map(([key, value]) => {
                let label = FIELD_LABELS[key] || key;
                let displayValue = value;
                if (key === "createdAt" || key === "updatedAt" || key === "date") {
                  try {
                    displayValue = new Date(value).toLocaleString(
                      "es-ES",
                      key === "date"
                        ? { dateStyle: "long" }
                        : { dateStyle: "long", timeStyle: "short" }
                    );
                  } catch (e) {}
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
            {error && <div className="mt-modal-error">{error}</div>}
            <div className="mt-modal-actions">
              <button className="mt-modal-edit" onClick={() => setEditing(true)}>Editar</button>
              <button className="mt-modal-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </>
        ) : (
          <form className="mt-modal-editform" onSubmit={handleSubmit}>
            <div className="mt-modal-details">
              {Object.keys(form).map((key) => (
                <div className="mt-modal-detail-row" key={key}>
                  <strong>{FIELD_LABELS[key] || key}:</strong>
                  {key === "date" ? (
                    <input
                      type="date"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      required={["carModel", "date", "description", "cost"].includes(key)}
                    />
                  ) : key === "cost" ? (
                    <>
                      <input
                        type="number"
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      /> €
                    </>
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      required={["carModel", "date", "description", "cost"].includes(key)}
                    />
                  )}
                </div>
              ))}
            </div>
            {error && <div className="mt-modal-error">{error}</div>}
            <div className="mt-modal-actions">
              <button type="submit" className="mt-modal-edit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" className="mt-modal-delete" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserMaintenances;