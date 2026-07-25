"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDetailView() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("rutina");
  
  // Routine State
  const [routine, setRoutine] = useState<any>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  
  const [deletingRoutine, setDeletingRoutine] = useState(false);
  const [savingEx, setSavingEx] = useState<string | null>(null);

  // Anamnesis State
  const [anamnesisHistory, setAnamnesisHistory] = useState<any[]>([]);
  const [requestingAnamnesis, setRequestingAnamnesis] = useState(false);

  // Progress and Metrics
  const [progress, setProgress] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);

  const handleRequestAnamnesis = async () => {
    if (!confirm("¿Solicitar que el alumno complete una nueva encuesta de anamnesis? Esto ocultará su rutina hasta que lo haga.")) return;
    setRequestingAnamnesis(true);
    try {
      const res = await fetch(`/api/profesor/students/${id}/anamnesis/request`, { method: 'POST' });
      if (res.ok) {
        alert("Solicitud enviada exitosamente. El alumno verá el formulario en su próximo inicio de sesión.");
      } else {
        alert("Error al solicitar la encuesta");
      }
    } catch (e) {
      alert("Error de conexión");
    }
    setRequestingAnamnesis(false);
  };

  const handleDeleteRoutine = async () => {
    if (!confirm("¿Estás seguro que deseas eliminar esta rutina? Toda la información y progresos asociados se perderán.")) return;
    setDeletingRoutine(true);
    try {
      const res = await fetch(`/api/profesor/routines/${routine.id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoutine(null);
      } else {
        alert("Error al eliminar la rutina");
      }
    } catch (e) {
      alert("Error de conexión");
    }
    setDeletingRoutine(false);
  };

  const handleSetChange = (exId: string, setId: string, field: string, value: any) => {
    setRoutine((prev: any) => {
      const newRoutine = { ...prev };
      newRoutine.weeks = newRoutine.weeks.map((week: any) => {
        week.days = week.days.map((day: any) => {
          day.exercises = day.exercises.map((ex: any) => {
            if (ex.id === exId) {
              ex.sets = ex.sets.map((set: any) => {
                if (set.id === setId) {
                  return { ...set, [field]: value };
                }
                return set;
              });
            }
            return ex;
          });
          return day;
        });
        return week;
      });
      return newRoutine;
    });
  };

  const handleSaveSets = async (dailyExerciseId: string, exId: string) => {
    setSavingEx(exId);
    try {
      // Find the sets to save
      let setsToSave = [];
      for (const week of routine.weeks) {
        for (const day of week.days) {
          for (const ex of day.exercises) {
            if (ex.id === exId) {
              setsToSave = ex.sets;
            }
          }
        }
      }

      const res = await fetch(`/api/profesor/routines/sets/${dailyExerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sets: setsToSave })
      });

      if (res.ok) {
        alert("Cambios guardados");
      } else {
        alert("Error al guardar cambios");
      }
    } catch (error) {
      alert("Error de conexión");
    }
    setSavingEx(null);
  };

  useEffect(() => {
    if (!id) return;
    // Fetch Student Info
    fetch(`/api/profesor/students/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setStudent(data);
      });

    // Fetch Routine
    fetch(`/api/profesor/students/${id}/routine`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setRoutine(data);
      });

    // Fetch Anamnesis History
    fetch(`/api/profesor/students/${id}/anamnesis`)
      .then(r => r.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) setAnamnesisHistory(data);
      });

    // Fetch Progress
    fetch(`/api/profesor/students/${id}/progress`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setProgress(data);
      });

    // Fetch Metrics
    fetch(`/api/profesor/students/${id}/metrics`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setMetrics(data);
      });
  }, [id, params.id]);

  const activeWeek = routine?.weeks?.[activeWeekIndex];
  
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

  if (!student) return <div style={{ padding: '2rem', color: 'var(--foreground)' }}>Cargando perfil...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button className="btn-ghost" onClick={() => router.push('/dashboard/profesor')}>
          ← Volver
        </button>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--surface)', border: '2px solid var(--neon-fuchsia)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {student.profile_picture_url ? (
            <img src={student.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>👤</span>
          )}
        </div>
        <div>
          <h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: '1.5rem' }}>{student.name}</h1>
          <span style={{ color: 'var(--neon-fuchsia)', fontSize: '0.875rem' }}>@{student.username}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button style={{ background: 'transparent', color: activeTab === 'rutina' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'rutina' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'rutina' ? 'bold' : 'normal' }} onClick={() => setActiveTab('rutina')}>Rutina Activa</button>
        <button style={{ background: 'transparent', color: activeTab === 'encuesta' ? 'var(--neon-pink)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'encuesta' ? '2px solid var(--neon-pink)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'encuesta' ? 'bold' : 'normal' }} onClick={() => setActiveTab('encuesta')}>Encuesta</button>
        <button style={{ background: 'transparent', color: activeTab === 'metricas' ? 'var(--neon-green)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'metricas' ? '2px solid var(--neon-green)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'metricas' ? 'bold' : 'normal' }} onClick={() => setActiveTab('metricas')}>Métricas y RM</button>
      </div>

      {/* Routine Content */}
      {activeTab === 'rutina' && (
        <div>
          {!routine ? (
            <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Este alumno aún no tiene una rutina activa asignada.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--neon-pink)', fontSize: '1.25rem' }}>{routine.title}</h2>
                  <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>{routine.weeks?.length} sem. Creado: {new Date(routine.start_date).toLocaleDateString()}</span>
                </div>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteRoutine} 
                  disabled={deletingRoutine}
                >
                  {deletingRoutine ? 'Eliminando...' : 'Eliminar Rutina'}
                </button>
              </div>

              {/* Week Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
                {routine.weeks?.map((week: any, idx: number) => (
                  <button 
                    key={week.id} 
                    onClick={() => setActiveWeekIndex(idx)}
                    style={{ 
                      minWidth: '70px', padding: '0.75rem', borderRadius: '0.5rem', 
                      backgroundColor: idx === activeWeekIndex ? 'var(--surface-hover)' : 'var(--surface)',
                      border: `1px solid ${idx === activeWeekIndex ? 'var(--neon-fuchsia)' : 'var(--border)'}`,
                      color: idx === activeWeekIndex ? 'var(--neon-fuchsia)' : 'var(--foreground-muted)',
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
                    <div key={day.id} style={{ backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-hover)' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--neon-blue)' }}>
                          D
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--foreground)' }}>{day.day_name}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{day.exercises?.length || 0} ejercicios</span>
                        </div>
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {day.exercises?.map((ex: any, exIdx: number) => {
                            const isExpanded = expandedExercises[ex.id];
                            const color = getPillColor(exIdx);

                            if (!isExpanded) {
                              return (
                                <button 
                                  key={ex.id}
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
                              );
                            }

                            return (
                              <div key={ex.id} style={{ width: '100%', backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: color.border }}>{ex.exercise_name}</h4>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-primary" onClick={() => handleSaveSets(ex.id, ex.id)} disabled={savingEx === ex.id} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                                      {savingEx === ex.id ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button className="btn-ghost" onClick={() => toggleExercise(ex.id)} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>Cerrar</button>
                                  </div>
                                </div>
                                
                                <div className="table-responsive">
                                  <div className="table-responsive-inner" style={{ paddingBottom: '0.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 1.5fr 1fr 40px', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.5rem', padding: '0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  <div style={{ textAlign: 'center' }}>#</div>
                                  <div style={{ textAlign: 'center' }}>Peso (kg)</div>
                                  <div style={{ textAlign: 'center' }}>Reps</div>
                                  <div style={{ textAlign: 'center' }} title="RPE Prescrito">Prof.</div>
                                  <div style={{ textAlign: 'center' }} title="RPE Percibido">Tu RPE</div>
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
                                        <input type="number" placeholder="kg" value={set.weight || ''} onChange={e => handleSetChange(ex.id, set.id, 'weight', Number(e.target.value))} style={{ width: '100%', maxWidth: '80px', padding: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center', fontSize: '0.875rem' }} />
                                      </div>
                                      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        <input type="number" value={set.reps || ''} onChange={e => handleSetChange(ex.id, set.id, 'reps', Number(e.target.value))} style={{ width: '100%', maxWidth: '60px', padding: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }} />
                                      </div>
                                      <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--foreground-muted)' }}>
                                        <input type="number" value={set.rpe || ''} onChange={e => handleSetChange(ex.id, set.id, 'rpe', Number(e.target.value))} style={{ width: '100%', maxWidth: '60px', padding: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px dashed var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }} />
                                      </div>
                                      <div style={{ textAlign: 'center' }}>
                                        <input type="number" placeholder="rpe" disabled style={{ width: '100%', maxWidth: '60px', padding: '0.4rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-hover)', borderRadius: '0.25rem', color: 'var(--foreground-muted)', textAlign: 'center', fontSize: '0.875rem', opacity: 0.5, cursor: 'not-allowed' }} />
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
            </>
          )}
        </div>
      )}

      {activeTab === 'encuesta' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: 'var(--neon-pink)', fontSize: '1.25rem' }}>Encuestas (Anamnesis)</h2>
            <button 
              onClick={handleRequestAnamnesis} 
              disabled={requestingAnamnesis}
              style={{ background: 'var(--neon-blue)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', color: 'var(--background)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {requestingAnamnesis ? 'Solicitando...' : 'Solicitar Nueva Encuesta'}
            </button>
          </div>

          {anamnesisHistory.length === 0 ? (
            <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Este alumno aún no ha completado su encuesta inicial.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {anamnesisHistory.map((form, idx) => (
                <div key={form.id} style={{ backgroundColor: 'var(--surface)', borderRadius: '1rem', border: `1px solid ${idx === 0 && form.is_active ? 'var(--neon-green)' : 'var(--border)'}`, padding: '1.5rem', opacity: form.is_active ? 1 : 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--foreground)', fontSize: '1.1rem' }}>
                      {new Date(form.created_at).toLocaleDateString()} {idx === 0 && form.is_active && <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0, 255, 136, 0.2)', color: 'var(--neon-green)', padding: '0.25rem 0.5rem', borderRadius: '1rem', marginLeft: '0.5rem' }}>Activa</span>}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Objetivo</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.training_goal || '-'}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Frecuencia Semanal</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.weekly_frequency || '-'} días</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Experiencia</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.training_experience || '-'}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Peso y Altura</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.current_weight ? `${form.current_weight} kg` : '-'} / {form.height ? `${form.height} cm` : '-'}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Lesiones / Condiciones</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.injuries_conditions || 'Ninguna'}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Preferencia de División</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.split_preference || '-'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Intereses Musculares</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.muscle_interests || '-'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Preferencias de Ejercicios</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.exercise_preferences || '-'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Comentarios Adicionales</h4>
                      <p style={{ margin: 0, color: 'var(--foreground)' }}>{form.additional_comments || 'Ninguno'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'metricas' && (
        <div>
          {/* PROGRESO */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Progreso del Alumno</h2>
            {progress ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
            ) : (
              <p style={{ color: 'var(--foreground-muted)' }}>Cargando progreso...</p>
            )}
            
            {/* Calendario (Solo Lectura) */}
            {progress && (
              <div style={{ backgroundColor: 'var(--surface-hover)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', minHeight: '300px', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ margin: '0', color: 'var(--foreground)' }}>Asistencia: {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}</h3>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                    <div key={day} style={{ fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>{day}</div>
                  ))}
                  
                  {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() + (new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() === 0 ? 6 : new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() - 1) }).map((_, i) => {
                    const offset = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() === 0 ? 6 : new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() - 1;
                    if (i < offset) return <div key={i} style={{ padding: '0.5rem' }}></div>;
                    
                    const dateNum = i - offset + 1;
                    const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                    const hasAttended = progress.attendanceDates?.includes(dateStr);
                    const isPlanned = progress.plannedDates?.includes(dateStr);
                    
                    let bgColor = 'var(--surface)';
                    let color = 'var(--foreground)';
                    let border = '1px solid var(--border)';
                    
                    if (hasAttended) {
                      bgColor = 'var(--neon-blue)';
                      color = 'var(--background)';
                    } else if (isPlanned) {
                      border = '1px dashed var(--neon-pink)';
                      color = 'var(--neon-pink)';
                    }
                    
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          padding: '0.75rem 0.5rem', 
                          backgroundColor: bgColor, 
                          color: color,
                          borderRadius: '0.5rem', 
                          border: border,
                          fontWeight: (hasAttended || isPlanned) ? 'bold' : 'normal',
                        }}
                        title={dateStr}
                      >
                        {dateNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* METRICAS */}
          <div>
            <h2 style={{ color: 'var(--neon-green)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Métricas y RM</h2>
            {metrics.length === 0 ? (
              <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📊</span>
                <p style={{ color: 'var(--foreground-muted)' }}>Este alumno aún no tiene métricas registradas de su entrenamiento.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {metrics.slice(0, 3).map(m => (
                    <div key={m.exercise} style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
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
                  <div key={m.exercise + '_chart'} style={{ marginTop: '1.5rem', backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
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
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
