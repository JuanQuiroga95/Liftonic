"use client";

import { useState, useEffect } from "react";
import RoutineBuilder from "./RoutineBuilder";

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlumnos = () => {
    fetch("/api/profesor/students")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
        else setStudents([]);
      })
      .catch(() => setStudents([]));
  };

  const fetchEjercicios = () => {
    fetch("/api/profesor/exercises")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setExercises(data);
        else setExercises([]);
      })
      .catch(() => setExercises([]));
  };

  useEffect(() => {
    Promise.all([fetchAlumnos(), fetchEjercicios()]).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--neon-fuchsia)', fontSize: '2rem', margin: '0 0 1rem 0' }}>Panel de Profesor</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ background: 'transparent', color: activeTab === 'alumnos' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'alumnos' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'alumnos' ? 'bold' : 'normal' }} onClick={() => setActiveTab('alumnos')}>Mis Alumnos</button>
            <button style={{ background: 'transparent', color: activeTab === 'rutinas' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'rutinas' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'rutinas' ? 'bold' : 'normal' }} onClick={() => setActiveTab('rutinas')}>Constructor de Rutinas</button>
            <button style={{ background: 'transparent', color: activeTab === 'ejercicios' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'ejercicios' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'ejercicios' ? 'bold' : 'normal' }} onClick={() => setActiveTab('ejercicios')}>Biblioteca Ejercicios</button>
          </div>
        </div>
        <button onClick={() => { window.location.href = '/api/auth/signout'; }} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sesión</button>
      </header>

      {loading ? (
        <p style={{ color: 'var(--neon-blue)', textAlign: 'center' }}>Cargando datos...</p>
      ) : (
        <>
          {activeTab === 'alumnos' && <StudentManager students={students} onReload={fetchAlumnos} />}
          {activeTab === 'ejercicios' && <ExerciseLibrary exercises={exercises} onReload={fetchEjercicios} />}
          {activeTab === 'rutinas' && <RoutineBuilder students={students} exercises={exercises} />}
        </>
      )}
    </div>
  );
}

function StudentManager({ students, onReload }: { students: any[], onReload: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profesor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      if (res.ok) {
        setShowModal(false);
        setName(""); setUsername(""); setPassword("");
        onReload();
      } else {
        alert("Error creando alumno");
      }
    } catch (err) {
      alert("Error de conexión");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar definitivamente a este alumno?")) return;
    try {
      const res = await fetch(`/api/profesor/students?id=${id}`, { method: "DELETE" });
      if (res.ok) onReload();
      else alert("Error eliminando alumno");
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const handleReset = async (id: string) => {
    if (!confirm("¿Archivar anamnesis actual? El alumno deberá llenar el formulario al ingresar.")) return;
    try {
      const res = await fetch('/api/profesor/students/reset', {
        method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id })
      });
      if (res.ok) alert("Anamnesis archivada con éxito.");
    } catch (err) {
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--foreground)' }}>Mis Alumnos</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>Gestiona a tus alumnos y su historial.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-fuchsia)', color: 'var(--background)', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Nuevo Alumno</button>
      </div>

      {showModal && (
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Crear Nuevo Alumno</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Nombre Completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Contraseña Temporal</label>
              <input value={password} onChange={e => setPassword(e.target.value)} required type="text" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-blue)', color: 'var(--background)', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{saving ? 'Guardando...' : 'Crear'}</button>
            </div>
          </form>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)', textTransform: 'uppercase', fontSize: '0.875rem' }}>Nombre</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)', textTransform: 'uppercase', fontSize: '0.875rem' }}>Usuario</th>
            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)', textTransform: 'uppercase', fontSize: '0.875rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>No tienes alumnos aún.</td></tr>
          ) : (
            students.map(s => (
              <tr key={s.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>{s.name}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>{s.username}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => handleReset(s.id)}>Resetear Formulario</button>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => handleDelete(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ExerciseLibrary({ exercises, onReload }: { exercises: any[], onReload: () => void }) {
  const [name, setName] = useState("");
  const [mediaType, setMediaType] = useState("LINK");
  const [mediaUrl, setMediaUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalUrl = mediaUrl;

    if (mediaType === "UPLOAD" && file) {
      try {
        const response = await fetch(`/api/profesor/upload?filename=${file.name}`, { method: "POST", body: file });
        const data = await response.json();
        if (data.url) finalUrl = data.url;
        else alert("Error subiendo el archivo: " + data.error);
      } catch (err) {
        alert("Error de subida");
      }
    }

    if (!finalUrl) {
      setLoading(false);
      return;
    }

    await fetch('/api/profesor/exercises', {
      method: "POST",
      body: JSON.stringify({ name, media: [{ type: mediaType, url: finalUrl }] })
    });

    setName(""); setMediaUrl(""); setFile(null);
    onReload();
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h2>Biblioteca de Ejercicios</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        <input placeholder="Nombre del Ejercicio" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        <select value={mediaType} onChange={e => setMediaType(e.target.value)} style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}>
          <option value="LINK">Link de YouTube/Insta</option>
          <option value="UPLOAD">Subir Archivo (Cloudinary)</option>
        </select>
        {mediaType === "LINK" ? (
          <input placeholder="URL del video" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} required style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        ) : (
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        )}
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-fuchsia)', color: 'var(--background)', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Guardando...' : 'Crear Ejercicio'}</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {exercises.map(e => (
          <div key={e.id} style={{ padding: '1rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{e.name}</h3>
            {e.media && e.media[0] && (
              <a href={e.media[0].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', fontSize: '0.875rem', textDecoration: 'none' }}>Ver Multimedia</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
