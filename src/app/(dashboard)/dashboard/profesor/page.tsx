"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import LogoutButton from "@/components/ui/LogoutButton";

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profesor/students").then(r => r.json()).then(setStudents);
    fetch("/api/profesor/exercises").then(r => r.json()).then(setExercises);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Panel de Profesor</h1>
          <div className={styles.tabs}>
            <button className={activeTab === 'alumnos' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('alumnos')}>Mis Alumnos</button>
            <button className={activeTab === 'rutinas' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('rutinas')}>Crear Rutina</button>
            <button className={activeTab === 'ejercicios' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('ejercicios')}>Biblioteca Ejercicios</button>
          </div>
        </div>
        <LogoutButton />
      </header>

      {activeTab === 'alumnos' && (
        <div className={styles.contentSection}>
          <h2>Mis Alumnos</h2>
          <p className={styles.muted}>Gestiona a tus alumnos y su historial.</p>
          <table className={styles.table}>
            <thead><tr><th>Nombre</th><th>Usuario</th><th>Acciones</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.username}</td>
                  <td>
                    <button className={styles.btnSecondary} onClick={() => {
                      fetch('/api/profesor/students/reset', {
                        method: 'POST', body: JSON.stringify({ studentId: s.id })
                      }).then(() => alert('Formulario reseteado'));
                    }}>Resetear Formulario</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ejercicios' && (
        <ExerciseLibrary exercises={exercises} onReload={() => fetch("/api/profesor/exercises").then(r => r.json()).then(setExercises)} />
      )}

      {activeTab === 'rutinas' && (
        <div className={styles.contentSection}>
          <h2>Crear Rutina (Próximamente)</h2>
          <p className={styles.muted}>El constructor avanzado de rutinas se integrará aquí.</p>
        </div>
      )}
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
      const response = await fetch(`/api/profesor/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const data = await response.json();
      finalUrl = data.url;
    }

    await fetch('/api/profesor/exercises', {
      method: "POST",
      body: JSON.stringify({
        name,
        media: finalUrl ? [{ type: mediaType, url: finalUrl }] : []
      })
    });

    setName(""); setMediaUrl(""); setFile(null);
    onReload();
    setLoading(false);
  };

  return (
    <div className={styles.contentSection}>
      <h2>Biblioteca de Ejercicios</h2>
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <input placeholder="Nombre del Ejercicio" value={name} onChange={e => setName(e.target.value)} required className={styles.input} />
        
        <select value={mediaType} onChange={e => setMediaType(e.target.value)} className={styles.input}>
          <option value="LINK">Link de YouTube/Insta</option>
          <option value="UPLOAD">Subir Archivo</option>
        </select>

        {mediaType === "LINK" ? (
          <input placeholder="URL del video" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} className={styles.input} />
        ) : (
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className={styles.input} />
        )}

        <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Guardando...' : 'Crear Ejercicio'}</button>
      </form>

      <div style={{marginTop: '2rem'}}>
        {exercises.map(e => (
          <div key={e.id} style={{padding: '1rem', border: '1px solid var(--border)', marginBottom: '1rem', borderRadius: '0.5rem'}}>
            <h3>{e.name}</h3>
            {e.media && e.media[0] && (
              <a href={e.media[0].url} target="_blank" style={{color: 'var(--neon-blue)'}}>Ver Multimedia</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
