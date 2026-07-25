"use client";

import { useState, useEffect } from "react";
import AnamnesisForm from "@/components/forms/AnamnesisForm";
import LogoutButton from "@/components/ui/LogoutButton";

export default function AlumnoDashboard() {
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("entreno");

  useEffect(() => {
    Promise.all([
      fetch('/api/alumno/anamnesis').then(r => r.json()),
      fetch('/api/alumno/profile').then(r => r.json())
    ]).then(([anamnesisData, profileData]) => {
      setAnamnesis(anamnesisData);
      setProfile(profileData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{padding: '2rem', color: 'var(--neon-blue)', textAlign: 'center'}}>Cargando tu perfil...</div>;

  // Si no tiene anamnesis activa o es null, mostrar el formulario
  if (!anamnesis) {
    return (
      <div style={{padding: '2rem'}}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}><LogoutButton /></div>
        <AnamnesisForm onComplete={() => window.location.reload()} />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "entreno":
        return <RoutineViewer />;
      case "progreso":
        return <ProgressViewer />;
      case "metricas":
        return <MetricsViewer />;
      case "perfil":
        return <ProfileViewer anamnesis={anamnesis} />;
      default:
        return <RoutineViewer />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '250px' : '60px', 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border)', 
        transition: 'width 0.3s ease',
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          style={{ 
            background: 'none', border: 'none', color: 'var(--neon-fuchsia)', 
            padding: '1rem', cursor: 'pointer', textAlign: sidebarOpen ? 'right' : 'center',
            fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid var(--surface-hover)'
          }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
          {[
            { id: "entreno", icon: "💪", label: "Entreno", color: "var(--neon-fuchsia)" },
            { id: "progreso", icon: "📈", label: "Progreso", color: "var(--neon-blue)" },
            { id: "metricas", icon: "📊", label: "Métricas", color: "var(--neon-green)" },
            { id: "perfil", icon: "👤", label: "Perfil", color: "#f59e0b" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', background: activeTab === tab.id ? 'var(--surface-hover)' : 'transparent',
                border: 'none', borderRight: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : 'var(--foreground-muted)',
                cursor: 'pointer', transition: 'all 0.2s',
                overflow: 'hidden', whiteSpace: 'nowrap'
              }}
              title={!sidebarOpen ? tab.label : ''}
            >
              <span style={{ fontSize: '1.25rem', width: '30px', textAlign: 'center' }}>{tab.icon}</span>
              <span style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s', fontWeight: 'bold' }}>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout (Sidebar Bottom) */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--surface-hover)', textAlign: sidebarOpen ? 'left' : 'center' }}>
          <button 
            onClick={() => { window.location.href = '/api/auth/signout'; }} 
            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.5rem 0' }}
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
          >
            <span style={{ fontSize: '1.25rem', width: '30px', textAlign: 'center' }}>🚪</span>
            <span style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s', fontWeight: 'bold' }}>Salir</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto' }}>
        
        {/* Header con Saludo */}
        {profile && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--foreground)', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
              ¡Hola, {profile.name.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '1.1rem', margin: 0 }}>
              Bienvenido de nuevo a tu espacio de entrenamiento.
            </p>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', minHeight: '80vh' }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function RoutineViewer() {
  const [routine, setRoutine] = useState<any>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState<any>(null);

  useEffect(() => {
    fetch('/api/alumno/routine').then(r => r.json()).then(setRoutine);
  }, []);

  if (!routine || routine.error) return <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Tu profesor aún no te ha asignado una rutina.</p>;

  const activeWeek = routine.weeks?.[activeWeekIndex];

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };
  
  const toggleExercise = (exId: string) => {
    setExpandedExercises(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const getPillColor = (index: number) => {
    const colors = ['rgba(255, 0, 128, 0.2)', 'rgba(0, 229, 255, 0.2)', 'rgba(0, 255, 136, 0.2)', 'rgba(245, 158, 11, 0.2)'];
    const borders = ['var(--neon-pink)', 'var(--neon-blue)', 'var(--neon-green)', '#f59e0b'];
    return { bg: colors[index % colors.length], border: borders[index % borders.length] };
  };

  const summarizeSets = (sets: any[]) => {
    if (!sets || sets.length === 0) return "";
    const summary = sets.map(s => `${s.reps} @${s.rpe}`).join(" + ");
    return summary.length > 20 ? `${sets.length} series` : summary;
  };

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];
  
  let todayMessage = "😴 Hoy descansamos";
  if (activeWeek && activeWeek.days) {
    const todayRoutine = activeWeek.days.find((d: any) => d.day_name.toLowerCase().includes(todayName.toLowerCase()));
    if (todayRoutine) {
      todayMessage = `💪 Hoy tenés gym: ${todayRoutine.day_name}`;
    } else if (activeWeek.days.length > 0) {
      // Fallback si los dias no se llaman lunes/martes sino dia 1, dia 2
      todayMessage = `📅 Próximo entreno en tu rutina: ${activeWeek.days[0].day_name}`;
    }
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--foreground)', fontSize: '1.5rem' }}>{routine.title}</h2>
          <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>{routine.weeks?.length} sem. Creado: {new Date(routine.start_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--neon-blue)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: 'var(--neon-blue)', fontWeight: 'bold' }}>
        {todayMessage}
      </div>

      {/* Week Selector Scroll */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {routine.weeks?.map((week: any, idx: number) => (
          <button 
            key={week.id} 
            onClick={() => setActiveWeekIndex(idx)}
            style={{ 
              minWidth: '70px', padding: '0.75rem', borderRadius: '0.5rem', 
              backgroundColor: idx === activeWeekIndex ? 'var(--surface-hover)' : 'var(--background)',
              border: `1px solid ${idx === activeWeekIndex ? 'var(--foreground)' : 'var(--border)'}`,
              color: idx === activeWeekIndex ? 'var(--foreground)' : 'var(--foreground-muted)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sem</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{week.week_number}</div>
          </button>
        ))}
      </div>

      {/* Active Week Days */}
      {activeWeek && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeWeek.days?.map((day: any) => (
            <div key={day.id} style={{ backgroundColor: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-hover)' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  -
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{day.day_name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{day.exercises?.length || 0} ejercicios</span>
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {day.exercises?.map((ex: any, exIdx: number) => {
                    const isExpanded = expandedExercises[ex.id];
                    const color = getPillColor(exIdx);

                    if (!isExpanded) {
                      // Pill view
                      return (
                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => toggleExercise(ex.id)}
                            style={{ 
                              backgroundColor: color.bg, border: `1px solid ${color.border}`, 
                              padding: '0.5rem 1rem', borderRadius: '2rem', color: 'var(--foreground)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <strong style={{ color: color.border }}>{ex.exercise_name}</strong>
                            <span style={{ opacity: 0.8 }}>{summarizeSets(ex.sets)}</span>
                          </button>
                          <button className="btn-ghost" onClick={() => setInfoModal(ex)} title="Ver instrucciones" style={{ borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', padding: 0 }}>
                            ℹ️
                          </button>
                        </div>
                      );
                    }

                    // Expanded Table View
                    return (
                      <div key={ex.id} style={{ width: '100%', backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: color.border }}>{ex.exercise_name}</h4>
                            <button className="btn-ghost" onClick={() => setInfoModal(ex)} title="Ver instrucciones" style={{ borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', padding: 0 }}>
                              ℹ️
                            </button>
                          </div>
                            <button className="btn-ghost" onClick={() => toggleExercise(ex.id)}>Cerrar</button>
                        </div>
                        
                        <div className="table-responsive">
                          <div className="table-responsive-inner" style={{ paddingBottom: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 1.5fr 1fr 40px', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.5rem', padding: '0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <div style={{ textAlign: 'center' }}>#</div>
                          <div style={{ textAlign: 'center' }}>Peso (kg)</div>
                          <div style={{ textAlign: 'center' }}>Reps</div>
                          <div style={{ textAlign: 'center' }} title="RPE Prescrito por el Profesor">Prof.</div>
                          <div style={{ textAlign: 'center' }} title="RPE Percibido por el Alumno">Tu RPE</div>
                          <div style={{ textAlign: 'center' }}>Tipo</div>
                          <div style={{ textAlign: 'center' }}>✓</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {ex.sets?.map((set: any, sIdx: number) => (
                            <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 1.5fr 1fr 40px', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--surface)', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                              <div style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                {sIdx + 1}
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <input type="number" placeholder="kg" defaultValue={set.weight} style={{ width: '100%', maxWidth: '80px', padding: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center', fontSize: '0.875rem' }} />
                              </div>
                              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{set.reps}</div>
                              <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>{set.rpe}</div>
                              <div style={{ textAlign: 'center' }}>
                                <input type="number" placeholder="rpe" style={{ width: '100%', maxWidth: '60px', padding: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center', fontSize: '0.875rem' }} />
                              </div>
                              <div style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: set.type === 'Top' ? 'var(--neon-pink)' : (set.type === 'Back' ? '#f59e0b' : 'var(--foreground)') }}>{set.type}</div>
                              <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: color.border, borderRadius: '0.25rem' }} />
                              </div>
                            </div>
                          ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Modal */}
      {infoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', width: '100%', maxWidth: '600px', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--neon-blue)', fontSize: '1.25rem' }}>{infoModal.exercise_name}</h3>
              <button className="btn-ghost" onClick={() => setInfoModal(null)} style={{ fontSize: '1.5rem', lineHeight: 1, padding: '0 0.5rem' }}>&times;</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {infoModal.media && infoModal.media[0]?.url ? (
                <div style={{ marginBottom: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#000', display: 'flex', justifyContent: 'center' }}>
                  {(() => {
                    const url = infoModal.media[0].url;
                    const isVideo = url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes("cloudinary") && !url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

                    if (isYouTube) {
                      return (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, width: '100%' }}>
                          <iframe src={getEmbedUrl(url)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen title={infoModal.exercise_name}></iframe>
                        </div>
                      );
                    } else if (isImage) {
                      return <img src={url} alt={infoModal.exercise_name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />;
                    } else if (isVideo || url.includes("cloudinary")) {
                      return <video src={url} controls style={{ maxWidth: '100%', maxHeight: '400px' }}></video>;
                    } else {
                      return <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-blue)', padding: '2rem', display: 'block' }}>Abrir enlace multimedia</a>;
                    }
                  })()}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
                  <p style={{ margin: 0, color: 'var(--foreground-muted)' }}>No hay video asignado a este ejercicio.</p>
                </div>
              )}

              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>Instrucciones</h4>
                <p style={{ margin: 0, color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {infoModal.description || "El profesor aún no ha añadido una descripción para este ejercicio."}
                </p>
              </div>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-hover)', textAlign: 'right' }}>
              <button className="btn-ghost" onClick={() => setInfoModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressViewer() {
  const [progress, setProgress] = useState<any>(null);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    fetch('/api/alumno/progress').then(r => r.json()).then(setProgress);
  }, []);

  const handleTogglePlan = async (dateStr: string, hasAttended: boolean) => {
    // Si ya asistió, no lo puede marcar como "planeado" porque ya es un hecho consumado
    if (hasAttended) return;
    
    const isPlanned = progress.plannedDates?.includes(dateStr);
    const action = isPlanned ? 'remove' : 'add';
    
    setToggling(prev => ({ ...prev, [dateStr]: true }));
    
    try {
      const res = await fetch('/api/alumno/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, action })
      });
      
      if (res.ok) {
        setProgress((prev: any) => ({
          ...prev,
          plannedDates: isPlanned 
            ? (prev.plannedDates || []).filter((d: string) => d !== dateStr) 
            : [...(prev.plannedDates || []), dateStr]
        }));
      }
    } catch (e) {
      console.error(e);
    }
    
    setToggling(prev => ({ ...prev, [dateStr]: false }));
  };

  if (!progress) return <div style={{padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)'}}>Cargando progreso...</div>;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const calendarDays = [];
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  for(let i = 0; i < offset; i++) {
    calendarDays.push(null);
  }
  for(let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const hasAttended = progress.attendanceDates?.includes(dateStr);
    const isPlanned = progress.plannedDates?.includes(dateStr);
    calendarDays.push({ date: i, hasAttended, isPlanned, dateStr });
  }

  return (
    <div>
      <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tu Progreso</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>{progress.trainedDays || 0}</div>
          <div style={{ color: 'var(--foreground)' }}>Días Entrenados</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{progress.streak || 0}</div>
          <div style={{ color: 'var(--foreground)' }}>Semanas de Racha</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>{progress.compliance || 0}%</div>
          <div style={{ color: 'var(--foreground)' }}>Cumplimiento</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface-hover)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', minHeight: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: '0', color: 'var(--foreground)' }}>Calendario de Entrenamientos</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--neon-blue)', borderRadius: '0.25rem' }}></div>
              <span style={{ color: 'var(--foreground)' }}>Entrenado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--neon-pink)', borderRadius: '0.25rem' }}></div>
              <span style={{ color: 'var(--foreground)' }}>Planeado</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '1rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
          {today.toLocaleString('es', { month: 'long', year: 'numeric' })}. Haz clic en un día futuro para planificar tu asistencia.
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} style={{ fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{day}</div>
          ))}
          {calendarDays.map((dayObj, i) => {
            if (!dayObj) return <div key={i} style={{ padding: '0.5rem' }}></div>;
            
            const isToggling = toggling[dayObj.dateStr];
            let bgColor = 'var(--surface)';
            let color = 'var(--foreground)';
            let border = '1px solid var(--border)';
            
            if (dayObj.hasAttended) {
              bgColor = 'var(--neon-blue)';
              color = 'var(--background)';
            } else if (dayObj.isPlanned) {
              border = '1px dashed var(--neon-pink)';
              color = 'var(--neon-pink)';
            }
            
            return (
              <button 
                key={i} 
                onClick={() => handleTogglePlan(dayObj.dateStr, dayObj.hasAttended)}
                disabled={isToggling}
                style={{ 
                  padding: '0.75rem 0.5rem', 
                  backgroundColor: bgColor, 
                  color: color,
                  borderRadius: '0.5rem', 
                  border: border,
                  fontWeight: (dayObj.hasAttended || dayObj.isPlanned) ? 'bold' : 'normal',
                  cursor: dayObj.hasAttended ? 'default' : 'pointer',
                  opacity: isToggling ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                title={dayObj.dateStr}
              >
                {dayObj.date}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MetricsViewer() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alumno/metrics')
      .then(r => r.json())
      .then(data => {
        setMetrics(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)'}}>Cargando métricas...</div>;

  if (metrics.length === 0) {
    return (
      <div>
        <h2 style={{ color: 'var(--neon-green)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tus Métricas y Récords</h2>
        <div style={{ marginTop: '2rem', backgroundColor: 'var(--background)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--foreground-muted)' }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📊</span>
          <p>Aún no hay métricas registradas. ¡Comienza a guardar tus entrenamientos!</p>
        </div>
      </div>
    );
  }

  const topMetrics = metrics.slice(0, 3);
  
  return (
    <div>
      <h2 style={{ color: 'var(--neon-green)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tus Métricas y Récords</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {topMetrics.map(m => (
          <div key={m.exercise} style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>{m.exercise}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>{m.pr}</span>
              <span style={{ color: 'var(--foreground-muted)' }}>kg</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>PR histórico - {m.date}</div>
          </div>
        ))}
      </div>

      {metrics.map(m => (
        <div key={m.exercise + '_chart'} style={{ marginTop: '1.5rem', backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)', fontSize: '1.1rem' }}>Evolución: {m.exercise}</h3>
          <div style={{ height: '250px', width: '100%' }}>
            {m.history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.history}>
                  <XAxis dataKey="date" stroke="var(--foreground-muted)" fontSize={12} />
                  <YAxis stroke="var(--foreground-muted)" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                    itemStyle={{ color: 'var(--neon-green)', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="var(--neon-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--neon-green)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--foreground-muted)' }}>
                Se necesitan más registros para graficar la evolución.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileViewer({ anamnesis }: { anamnesis: any }) {
  if (!anamnesis) return null;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--neon-fuchsia)', margin: 0, fontSize: '1.5rem' }}>Mi Perfil de Entrenamiento</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--neon-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Datos Físicos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Edad:</span> <strong>{anamnesis.age ? `${anamnesis.age} años` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Peso:</span> <strong>{anamnesis.current_weight ? `${anamnesis.current_weight} kg` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Altura:</span> <strong>{anamnesis.height ? `${anamnesis.height} cm` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Nutricionista:</span> <strong>{anamnesis.sees_nutritionist ? 'Sí' : 'No'}</strong></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--neon-pink)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Objetivos y Preferencias</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Frecuencia:</span> <strong>{anamnesis.weekly_frequency ? `${anamnesis.weekly_frequency} días/sem` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>División:</span> <strong>{anamnesis.split_preference || '-'}</strong></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--foreground-muted)' }}>Objetivo principal:</span> 
              <span style={{ backgroundColor: 'var(--surface)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{anamnesis.training_goal || '-'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Historial y Observaciones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Experiencia previa:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem' }}>{anamnesis.training_experience || 'Sin datos'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Lesiones o patologías:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem', color: anamnesis.injuries_conditions ? '#ff4d4d' : 'inherit' }}>{anamnesis.injuries_conditions || 'Ninguna'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Intereses musculares:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem' }}>{anamnesis.muscle_interests || '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Otras actividades:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem' }}>{anamnesis.other_activities || 'Ninguna'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>¿Necesitas actualizar tus datos? Solicita a tu profesor que resetee tu formulario.</p>
      </div>
    </div>
  );
}
