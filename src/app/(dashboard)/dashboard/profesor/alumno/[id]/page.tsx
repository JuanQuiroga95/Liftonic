"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDetailView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("rutina");
  
  // Routine State
  const [routine, setRoutine] = useState<any>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch Student Info
    fetch(`/api/profesor/students/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setStudent(data);
      });

    // Fetch Routine
    fetch(`/api/profesor/students/${params.id}/routine`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setRoutine(data);
      });
  }, [params.id]);

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
        <button onClick={() => router.push('/dashboard/profesor')} style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'var(--foreground)', cursor: 'pointer' }}>
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
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button style={{ background: 'transparent', color: activeTab === 'rutina' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'rutina' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'rutina' ? 'bold' : 'normal' }} onClick={() => setActiveTab('rutina')}>Rutina Activa</button>
        <button style={{ background: 'transparent', color: activeTab === 'metricas' ? 'var(--neon-blue)' : 'var(--foreground-muted)', border: 'none', borderBottom: activeTab === 'metricas' ? '2px solid var(--neon-blue)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'metricas' ? 'bold' : 'normal' }} onClick={() => setActiveTab('metricas')}>Métricas y RM</button>
      </div>

      {/* Routine Content */}
      {activeTab === 'rutina' && (
        <div>
          {!routine ? (
            <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Este alumno aún no tiene una rutina activa asignada.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--neon-pink)', fontSize: '1.25rem' }}>{routine.title}</h2>
                  <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>{routine.weeks?.length} sem. Creado: {new Date(routine.start_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Week Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
                {routine.weeks?.map((week: any, idx: number) => (
                  <button 
                    key={week.id} 
                    onClick={() => setActiveWeekIndex(idx)}
                    style={{ 
                      minWidth: '70px', padding: '0.75rem', borderRadius: '0.5rem', 
                      backgroundColor: idx === activeWeekIndex ? 'var(--surface-hover)' : 'var(--background)',
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
                    <div key={day.id} style={{ backgroundColor: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: color.border }}>{ex.exercise_name}</h4>
                                  <button onClick={() => toggleExercise(ex.id)} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer' }}>Cerrar</button>
                                </div>
                                
                                <div style={{ display: 'flex', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                                  <div style={{ width: '2rem' }}>#</div>
                                  <div style={{ flex: 2 }}>KG</div>
                                  <div style={{ flex: 1, textAlign: 'center' }}>REPS</div>
                                  <div style={{ flex: 1, textAlign: 'center' }}>PROF.</div>
                                  <div style={{ flex: 1.5, textAlign: 'center' }}>ASESORADO</div>
                                  <div style={{ flex: 1, textAlign: 'center' }}>TIPO</div>
                                  <div style={{ width: '2rem', textAlign: 'center' }}>✓</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {ex.sets?.map((set: any, sIdx: number) => (
                                    <div key={set.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid var(--surface-hover)' }}>
                                      <div style={{ width: '2rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                                        {sIdx + 1}
                                      </div>
                                      <div style={{ flex: 2, paddingRight: '0.5rem' }}>
                                        <input type="number" placeholder="kg" defaultValue={set.weight} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                                      </div>
                                      <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                                        <input type="number" defaultValue={set.reps} style={{ width: '100%', maxWidth: '50px', padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: 'var(--foreground)', textAlign: 'center', fontWeight: 'bold' }} />
                                      </div>
                                      <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'var(--foreground-muted)' }}>{set.rpe}</div>
                                      <div style={{ flex: 1.5, textAlign: 'center' }}>
                                        <input type="number" placeholder="rpe" style={{ width: '100%', maxWidth: '50px', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                                      </div>
                                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.875rem', color: set.type === 'Top' ? 'var(--neon-pink)' : (set.type === 'Back' ? '#f59e0b' : 'var(--foreground)') }}>{set.type}</div>
                                      <div style={{ width: '2rem', textAlign: 'center' }}>
                                        <input type="checkbox" style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: color.border }} />
                                      </div>
                                    </div>
                                  ))}
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

      {activeTab === 'metricas' && (
        <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '1rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>Métricas y RM</h3>
          <p style={{ color: 'var(--foreground-muted)' }}>Gráficos de volumen y fatiga estarán disponibles aquí muy pronto.</p>
        </div>
      )}

    </div>
  );
}
