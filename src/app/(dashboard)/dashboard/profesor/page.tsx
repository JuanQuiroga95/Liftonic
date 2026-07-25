"use client";

import { useState, useEffect } from "react";
import RoutineBuilder from "./RoutineBuilder";
import { useRouter } from "next/navigation";

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
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

  const fetchProfile = () => {
    fetch("/api/profesor/profile")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setProfile(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([fetchAlumnos(), fetchEjercicios(), fetchProfile()]).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontSize: '2rem', margin: '0 0 1rem 0' }}>Panel de Profesor</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ background: 'transparent', color: activeTab === 'alumnos' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'alumnos' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'alumnos' ? 'bold' : 'normal' }} onClick={() => setActiveTab('alumnos')}>Mis Alumnos</button>
            <button style={{ background: 'transparent', color: activeTab === 'rutinas' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'rutinas' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'rutinas' ? 'bold' : 'normal' }} onClick={() => setActiveTab('rutinas')}>Constructor de Rutinas</button>
            <button style={{ background: 'transparent', color: activeTab === 'ejercicios' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'ejercicios' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'ejercicios' ? 'bold' : 'normal' }} onClick={() => setActiveTab('ejercicios')}>Biblioteca Ejercicios</button>
            <button style={{ background: 'transparent', color: activeTab === 'perfil' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'perfil' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'perfil' ? 'bold' : 'normal' }} onClick={() => setActiveTab('perfil')}>Mi Perfil</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', overflow: 'hidden', border: '2px solid var(--neon-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{profile.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Profesor</div>
              </div>
            </div>
          )}
          <button onClick={() => { window.location.href = '/api/auth/signout'; }} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sesión</button>
        </div>
      </header>

      {loading ? (
        <p style={{ color: 'var(--neon-blue)', textAlign: 'center' }}>Cargando datos...</p>
      ) : (
        <>
          {activeTab === 'alumnos' && <StudentManager students={students} onReload={fetchAlumnos} />}
          {activeTab === 'ejercicios' && <ExerciseLibrary exercises={exercises} onReload={fetchEjercicios} />}
          {activeTab === 'rutinas' && <RoutineBuilder students={students} exercises={exercises} onRefreshExercises={fetchEjercicios} />}
          {activeTab === 'perfil' && <ProfessorProfile profile={profile} onReload={fetchProfile} />}
        </>
      )}
    </div>
  );
}

function ProfessorProfile({ profile, onReload }: { profile: any, onReload: () => void }) {
  const [name, setName] = useState(profile?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalUrl = profile?.profile_picture_url;
      
      // Upload new photo to Cloudinary if file selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "IMAGE");
        const uploadRes = await fetch("/api/profesor/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) finalUrl = uploadData.url;
      }

      // Update Profile DB
      const res = await fetch("/api/profesor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile_picture_url: finalUrl }),
      });
      
      if (res.ok) {
        onReload();
        alert("Perfil actualizado correctamente");
      } else {
        alert("Error actualizando perfil");
      }
    } catch (err) {
      alert("Error de conexión");
    }
    setSaving(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--foreground)', marginBottom: '1.5rem' }}>Configuración de Perfil</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--background)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {file ? (
              <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : profile?.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '3rem' }}>👤</span>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>Foto de Perfil (Opcional)</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ color: 'var(--foreground)' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>Nombre Público</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        </div>

        <button type="submit" disabled={saving} style={{ padding: '0.75rem', backgroundColor: 'var(--neon-blue)', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
          {saving ? 'Guardando cambios...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  );
}

function StudentManager({ students, onReload }: { students: any[], onReload: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleOpenCreate = () => {
    setEditingId(null);
    setName(""); setUsername(""); setPassword("");
    setShowModal(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingId(student.id);
    setName(student.name);
    setUsername(student.username);
    setPassword(""); // Leave blank so it doesn't overwrite unless typed
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch("/api/profesor/students", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, username, password }),
      });
      if (res.ok) {
        setShowModal(false);
        setName(""); setUsername(""); setPassword("");
        onReload();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error guardando alumno");
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
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-fuchsia)', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Nuevo Alumno</button>
      </div>

      {showModal && (
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Editar Alumno' : 'Crear Nuevo Alumno'}</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Nombre Completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>{editingId ? 'Nueva Contraseña (opcional)' : 'Contraseña Temporal'}</label>
              <input value={password} onChange={e => setPassword(e.target.value)} required={!editingId} type="text" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1rem', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-blue)', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
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
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--neon-fuchsia)', color: 'var(--foreground)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 'bold' }} onClick={() => router.push(`/dashboard/profesor/alumno/${s.id}`)}>Ver Perfil</button>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => handleOpenEdit(s)}>Editar</button>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => handleReset(s.id)}>Resetear Formulario</button>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '0.5rem', cursor: 'pointer' }} onClick={() => handleDelete(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
function ExerciseLibrary({ exercises, onReload }: { exercises: any[], onReload: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variation, setVariation] = useState("");
  const [mediaType, setMediaType] = useState("NONE");
  const [mediaUrl, setMediaUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaType = mediaType;

      if (mediaType === "UPLOAD" && file) {
        // Configuraciones de Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"; 
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset"; 

        if (cloudName === "demo" || uploadPreset === "unsigned_preset") {
           alert("Por favor, configura tus credenciales de Cloudinary en el archivo .env o en el código.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // Subida directa
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Error al subir a Cloudinary");
        
        const uploadData = await uploadRes.json();
        finalMediaUrl = uploadData.secure_url;
        finalMediaType = "LINK"; // Para BD se guarda como URL externa
      }

      const mediaPayload = (finalMediaType === "LINK" && finalMediaUrl) ? [{ type: 'LINK', url: finalMediaUrl }] : [];

      await fetch('/api/profesor/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, variation, media: mediaPayload }),
      });

      setName(""); setDescription(""); setVariation(""); setMediaUrl(""); setFile(null);
      onReload();
    } catch (error) {
      alert("Ocurrió un error al guardar el ejercicio.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h2>Biblioteca de Ejercicios</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        <input placeholder="Nombre del Ejercicio" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        <input placeholder="Variación (Opcional, ej: Inclinado, Mancuernas)" value={variation} onChange={e => setVariation(e.target.value)} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        <textarea placeholder="Descripción / Notas (Opcional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        
        <select value={mediaType} onChange={e => setMediaType(e.target.value)} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}>
          <option value="NONE">Sin Video (Solo texto)</option>
          <option value="LINK">Enlace a Video (YouTube / Instagram)</option>
          <option value="UPLOAD">Subir Archivo (Video o Foto desde galería)</option>
        </select>
        
        {mediaType === "LINK" && (
          <div>
            <input placeholder="Ej: https://www.youtube.com/watch?v=..." value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Copiá y pegá el link de YouTube. El alumno lo podrá reproducir directamente en la app.</p>
          </div>
        )}
        {mediaType === "UPLOAD" && (
          <div>
            <input type="file" accept="video/*,image/*" onChange={e => setFile(e.target.files?.[0] || null)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Sube un video o foto directamente desde tu dispositivo.</p>
          </div>
        )}
        
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--neon-fuchsia)', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Subiendo y Guardando...' : 'Crear Ejercicio'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {exercises.map(e => (
          <div key={e.id} style={{ padding: '1rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{e.name} {e.variation && <span style={{color: 'var(--neon-blue)', fontSize: '0.875rem'}}>({e.variation})</span>}</h3>
            {e.description && <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{e.description}</p>}
            {e.media && e.media[0] && e.media[0].url && (
              <a href={e.media[0].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', fontSize: '0.875rem', textDecoration: 'none' }}>Ver Multimedia</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
