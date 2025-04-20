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

const NON_EDITABLE_FIELDS = [
  "_id",
  "createdAt",
  "updatedAt",
  "userId",
  "_rev",
  "owner",
  "propietario",
  "propietarioNombre",
];

const ITEMS_PER_PAGE = 5;

const UserMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

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
          setCurrentPage(1); // reset page on refresh
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

  // Lógica de paginación (falsa, todo en frontend)
  const totalPages = Math.max(
    1,
    Math.ceil(maintenances.length / ITEMS_PER_PAGE)
  );
  const paginatedMaintenances = maintenances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((p) => (p > 1 ? p - 1 : 1));
  const handleNext = () =>
    setCurrentPage((p) => (p < totalPages ? p + 1 : totalPages));

  return (
    <div className="user-mt-fullpage-bg">
      <div className="user-mt-card">
        <h2>Mis Mantenimientos</h2>
        <div className="user-mt-pagination-message">
          Haz clic sobre un mantenimiento para ver, editar o eliminar.
        </div>
        {loading ? (
          <div className="user-mt-loading">Cargando mantenimientos...</div>
        ) : !maintenances.length ? (
          <div className="user-mt-empty">
            No hay mantenimientos registrados.
          </div>
        ) : (
          <>
            <div className="user-mt-list">
              {paginatedMaintenances.map((item) => (
                <div
                  key={item._id}
                  className="user-mt-maint-card"
                  tabIndex={0}
                  onClick={() => setSelected(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelected(item);
                  }}
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
                    <strong>Descripción:</strong>{" "}
                    <span>{item.description}</span>
                  </div>
                  <div>
                    <strong>Coste:</strong> <span>{item.cost} €</span>
                  </div>
                  <div className="user-mt-date">
                    <em>
                      Creado: {new Date(item.createdAt).toLocaleString("es-ES")}
                    </em>
                  </div>
                </div>
              ))}
            </div>
            <div className="user-mt-pagination">
              <button
                className="user-mt-pagination-btn"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="user-mt-pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="user-mt-pagination-btn"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </>
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
  const [customFields, setCustomFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Lista de campos estándar (no personalizados)
  const STANDARD_FIELDS = ["carModel", "date", "description", "cost"];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Prepara los datos para edición, separando campos personalizados
  useEffect(() => {
    if (editing) {
      const editable = Object.keys(maintenance).filter(
        (key) => !NON_EDITABLE_FIELDS.includes(key)
      );
      const initialForm = {};
      const initialCustom = [];
      editable.forEach((key) => {
        if (STANDARD_FIELDS.includes(key)) {
          initialForm[key] = maintenance[key] ?? "";
        } else {
          initialCustom.push({ key, value: maintenance[key] ?? "" });
        }
      });
      setForm(initialForm);
      setCustomFields(initialCustom);
      setError("");
      setSaving(false);
    }
  }, [editing, maintenance]);

  // Maneja cambios en campos estándar
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Maneja cambios en campos personalizados
  const handleCustomFieldChange = (idx, field, value) => {
    setCustomFields((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  // Añadir campo personalizado
  const handleAddField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  // Eliminar campo personalizado
  const handleRemoveField = (idx) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const required = ["carModel", "date", "description", "cost"];
    // Validación de obligatorios
    const missing = required.filter((field) => !form[field]);
    if (missing.length) {
      setError("Por favor, completa todos los campos obligatorios.");
      setSaving(false);
      return;
    }
    // Montar objeto para el backend
    const updateObj = { ...form };
    customFields.forEach(({ key, value }) => {
      if (key && value) updateObj[key] = value;
    });

    try {
      const response = await fetch(
        `${API_URL}/api/maintenance/${maintenance._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateObj),
        }
      );
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
    if (!window.confirm("¿Seguro que deseas eliminar este mantenimiento?"))
      return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/api/maintenance/${maintenance._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
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

  const camposMostrar = Object.entries(maintenance).filter(
    ([key]) => !["userId", "_rev"].includes(key)
  );

  return (
    <div className="mt-modal-overlay" onClick={onClose}>
      <div
        className="mt-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button className="mt-modal-close" onClick={onClose} title="Cerrar">
          ×
        </button>
        <h3>Detalle de Mantenimiento</h3>
        {!editing ? (
          <>
            <div className="mt-modal-details">
              {camposMostrar.map(([key, value]) => {
                let label = FIELD_LABELS[key] || key;
                let displayValue = value;
                if (
                  key === "createdAt" ||
                  key === "updatedAt" ||
                  key === "date"
                ) {
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
              <button
                className="mt-modal-edit"
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
              <button
                className="mt-modal-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </>
        ) : (
          <form className="mt-modal-editform" onSubmit={handleSubmit}>
            <div className="mt-modal-details">
              {/* Campos estándar */}
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
        
              {/* Campos personalizados */}
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
                    Agrega información personalizada como <b>kilometraje</b>, <b>taller</b>, etc.
                  </div>
                )}
                {customFields.map((item, idx) => (
                  <div key={idx} className="custom-field-row">
                    <input
                      type="text"
                      placeholder="Nombre del campo (ej: kilometraje)"
                      value={item.key}
                      onChange={e => handleCustomFieldChange(idx, "key", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Valor (ej: 123456)"
                      value={item.value}
                      onChange={e => handleCustomFieldChange(idx, "value", e.target.value)}
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
            </div>
            {error && <div className="mt-modal-error">{error}</div>}
            <div className="mt-modal-actions">
              <button type="submit" className="mt-modal-edit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                className="mt-modal-delete"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
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
