"use client";

import { useState, useEffect } from "react";
import styles from "./ProfessorManager.module.css";

type Professor = {
  id: string;
  username: string;
  name: string;
  created_at: string;
};

export default function ProfessorManager() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/professors");
      if (res.ok) {
        const data = await res.json();
        setProfessors(data);
      }
    } catch (error) {
      console.error("Failed to fetch professors", error);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/professors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setUsername("");
        setPassword("");
        fetchProfessors(); // Reload list
      } else {
        const data = await res.json();
        setFormError(data.error || "Error al crear profesor");
      }
    } catch (error) {
      setFormError("Error de conexión");
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar a este profesor?")) return;
    try {
      const res = await fetch(`/api/admin/professors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProfessors();
      } else {
        alert("Error al eliminar profesor");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Gestión de Profesores</h2>
          <p className={styles.subtitle}>Crea y administra las cuentas de tus profesores.</p>
        </div>
        <button className={styles.btnCreate} onClick={() => setShowModal(true)}>
          + Nuevo Profesor
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando profesores...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Fecha de Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professors.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>No hay profesores registrados.</td>
                </tr>
              ) : (
                professors.map((prof) => (
                  <tr key={prof.id}>
                    <td>{prof.name}</td>
                    <td>{prof.username}</td>
                    <td>{new Date(prof.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(prof.id)}
                        style={{ color: '#ff4d4d', background: 'transparent', border: '1px solid #ff4d4d', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Crear Nuevo Profesor</h3>
            {formError && <p className={styles.error}>{formError}</p>}
            
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Ej. Martín García" 
                />
              </div>
              <div className={styles.field}>
                <label>Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="Ej. MartinG" 
                />
              </div>
              <div className={styles.field}>
                <label>Contraseña Temporal</label>
                <input 
                  type="text" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Ej. liftonic123" 
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  disabled={formLoading}
                >
                  {formLoading ? "Guardando..." : "Crear Profesor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
