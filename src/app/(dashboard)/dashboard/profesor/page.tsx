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
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) setActiveTab(tab);
    }
  }, []);

  return (
    <div className="pad-main" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="mobile-wrap" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontSize: '2rem', margin: '0 0 1rem 0' }}>Panel de Profesor</h1>
          <div className="mobile-wrap" style={{ gap: '1rem' }}>
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
          <button className="btn-danger" onClick={() => { window.location.href = '/api/auth/signout'; }}>Cerrar Sesión</button>
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
    <div className="pad-card" style={{ backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
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

        <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
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
        <button className="btn-primary" onClick={handleOpenCreate}>+ Nuevo Alumno</button>
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
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {students.length === 0 ? (
          <p style={{ color: 'var(--foreground-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>No tienes alumnos aún.</p>
        ) : (
          students.map(s => (
            <div key={s.id} style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{s.name}</div>
                <div style={{ color: 'var(--foreground-muted)' }}>@{s.username}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn-primary" onClick={() => router.push(`/dashboard/profesor/alumno/${s.id}`)}>Ver Perfil</button>
                <button className="btn-ghost" onClick={() => handleOpenEdit(s)}>Editar</button>
                <button className="btn-outline-blue" onClick={() => handleReset(s.id)}>Reset Form</button>
                <button className="btn-danger" onClick={() => handleDelete(s.id)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ExerciseLibrary({ exercises, onReload }: { exercises: any[], onReload: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variation, setVariation] = useState("");
  const [mediaType, setMediaType] = useState("NONE");
  const [mediaUrl, setMediaUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [mediaType2, setMediaType2] = useState("NONE");
  const [mediaUrl2, setMediaUrl2] = useState("");
  const [file2, setFile2] = useState<File | null>(null);
  const [showSecondMedia, setShowSecondMedia] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleEdit = (ex: any) => {
    setEditingId(ex.id);
    setName(ex.name);
    setDescription(ex.description || "");
    setVariation(ex.variation || "");
    
    if (ex.media && ex.media[0] && ex.media[0].url) {
      setMediaType(ex.media[0].type || "LINK");
      setMediaUrl(ex.media[0].url);
    } else {
      setMediaType("NONE");
      setMediaUrl("");
    }
    setFile(null);
    
    if (ex.media && ex.media[1] && ex.media[1].url) {
      setMediaType2(ex.media[1].type || "LINK");
      setMediaUrl2(ex.media[1].url);
      setShowSecondMedia(true);
    } else {
      setMediaType2("NONE");
      setMediaUrl2("");
      setShowSecondMedia(false);
    }
    setFile2(null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
    try {
      const res = await fetch(`/api/profesor/exercises/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Error al borrar");
        return;
      }
      onReload();
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName(""); setDescription(""); setVariation(""); 
    setMediaUrl(""); setFile(null); setMediaType("NONE");
    setMediaUrl2(""); setFile2(null); setMediaType2("NONE"); setShowSecondMedia(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaType = mediaType;

      if (mediaType === "UPLOAD" && file) {
        // Validar tamaño del archivo (ejemplo: max 150MB para que no tarde una eternidad)
        const MAX_MB = 150;
        if (file.size > MAX_MB * 1024 * 1024) {
          alert(`El archivo es demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). El límite es de ${MAX_MB}MB para evitar tiempos de carga excesivos.\n\nTip: Para reducir el tamaño, podés bajar la resolución de la cámara (ej: 1080p en lugar de 4K) o pasarte el video por WhatsApp (lo comprime) y subir esa versión.`);
          setLoading(false);
          return;
        }

        // Pedir la firma de seguridad a nuestro servidor
        const signRes = await fetch('/api/profesor/r2-sign', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type })
        });
        if (!signRes.ok) throw new Error("No se pudo iniciar la subida segura. Verifica las variables de entorno.");
        
        const signData = await signRes.json();
        
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error("Error de subida HTTP: " + xhr.status));
            }
          };
          xhr.onerror = () => reject(new Error("Error de red al subir archivo"));
          xhr.open("PUT", signData.signedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        finalMediaUrl = signData.publicUrl;
        finalMediaType = "LINK"; // Para BD se guarda como URL externa
      }

      let finalMediaUrl2 = mediaUrl2;
      let finalMediaType2 = mediaType2;

      if (mediaType2 === "UPLOAD" && file2) {
        const MAX_MB = 150;
        if (file2.size > MAX_MB * 1024 * 1024) {
          alert(`El segundo archivo es demasiado grande. El límite es de ${MAX_MB}MB.`);
          setLoading(false);
          return;
        }

        const signRes = await fetch('/api/profesor/r2-sign', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file2.name, contentType: file2.type })
        });
        if (!signRes.ok) throw new Error("No se pudo iniciar la subida segura del segundo archivo.");
        const signData = await signRes.json();
        
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error("Error de subida HTTP archivo 2: " + xhr.status));
            }
          };
          xhr.onerror = () => reject(new Error("Error de red al subir archivo 2"));
          xhr.open("PUT", signData.signedUrl);
          xhr.setRequestHeader("Content-Type", file2.type);
          xhr.send(file2);
        });

        finalMediaUrl2 = signData.publicUrl;
        finalMediaType2 = "LINK";
      }

      const mediaPayload = [];
      if (finalMediaType !== "NONE" && finalMediaUrl) {
        mediaPayload.push({ type: 'LINK', url: finalMediaUrl });
      }
      if (finalMediaType2 !== "NONE" && finalMediaUrl2) {
        mediaPayload.push({ type: 'LINK', url: finalMediaUrl2 });
      }

      const url = editingId ? `/api/profesor/exercises/${editingId}` : '/api/profesor/exercises';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, variation, media: mediaPayload }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al guardar");
      }

      alert("¡Ejercicio guardado con éxito!");
      cancelEdit();
      onReload();
    } catch (error: any) {
      alert(error.message || "Ocurrió un error al guardar el ejercicio.");
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h2>Biblioteca de Ejercicios</h2>
      <form id="exercise-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginBottom: '2rem' }}>
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

        {!showSecondMedia ? (
          <button type="button" className="btn-outline-blue" onClick={() => setShowSecondMedia(true)} style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            + Agregar 2do Video (Biserie)
          </button>
        ) : (
          <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'var(--foreground)' }}>Segundo Video (Opcional)</h4>
              <button type="button" onClick={() => { setShowSecondMedia(false); setMediaType2("NONE"); setMediaUrl2(""); setFile2(null); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem' }}>Quitar</button>
            </div>
            <select value={mediaType2} onChange={e => setMediaType2(e.target.value)} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}>
              <option value="NONE">Sin Video</option>
              <option value="LINK">Enlace a Video (YouTube / Instagram)</option>
              <option value="UPLOAD">Subir Archivo</option>
            </select>
            {mediaType2 === "LINK" && (
              <input placeholder="Ej: https://www.youtube.com/watch?v=..." value={mediaUrl2} onChange={e => setMediaUrl2(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            )}
            {mediaType2 === "UPLOAD" && (
              <input type="file" accept="video/*,image/*" onChange={e => setFile2(e.target.files?.[0] || null)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? (uploadProgress > 0 ? `Subiendo Video... ${uploadProgress}%` : 'Guardando...') : (editingId ? 'Actualizar Ejercicio' : 'Crear Ejercicio')}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={cancelEdit} disabled={loading}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {exercises.map(e => (
          <div key={e.id} style={{ padding: '1rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{e.name} {e.variation && <span style={{color: 'var(--neon-blue)', fontSize: '0.875rem'}}>({e.variation})</span>}</h3>
            {e.description && <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{e.description}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {e.media && e.media[0] && e.media[0].url && (
                <a href={e.media[0].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Ver Multimedia 1</a>
              )}
              {e.media && e.media[1] && e.media[1].url && (
                <a href={e.media[1].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>Ver Multimedia 2</a>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--surface-hover)', paddingTop: '1rem' }}>
              <button type="button" className="btn-outline-blue" onClick={() => handleEdit(e)} style={{ fontSize: '0.75rem', flex: 1 }}>Editar</button>
              <button type="button" className="btn-danger" onClick={() => handleDelete(e.id)} style={{ fontSize: '0.75rem', flex: 1 }}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
