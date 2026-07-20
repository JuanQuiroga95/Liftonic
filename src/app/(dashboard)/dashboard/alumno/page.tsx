"use client";

import { useState, useEffect } from "react";
import AnamnesisForm from "@/components/forms/AnamnesisForm";
import LogoutButton from "@/components/ui/LogoutButton";

export default function AlumnoDashboard() {
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alumno/anamnesis')
      .then(r => r.json())
      .then(data => {
        setAnamnesis(data);
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

  return (
    <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{color: 'var(--neon-fuchsia)', fontSize: '2rem', margin: 0}}>Mi Entrenamiento</h1>
        <LogoutButton />
      </div>
      
      <div style={{backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)'}}>
        <h2 style={{color: 'var(--neon-blue)', marginBottom: '1rem'}}>Rutina Activa</h2>
        <RoutineViewer />
      </div>
    </div>
  );
}

function RoutineViewer() {
  const [routine, setRoutine] = useState<any>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/alumno/routine').then(r => r.json()).then(setRoutine);
  }, []);

  if (!routine) return <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Tu profesor aún no te ha asignado una rutina.</p>;

  const activeWeek = routine.weeks?.[activeWeekIndex];
  
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
    // Group sets by identical reps and RPE to create summaries like "1x1 @6 + 2x3 @5"
    // For simplicity, we just join them or show a basic count if too complex.
    const summary = sets.map(s => `${s.reps} @${s.rpe}`).join(" + ");
    return summary.length > 20 ? `${sets.length} series` : summary;
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--foreground)', fontSize: '1.5rem' }}>{routine.title}</h2>
          <span style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>{routine.weeks?.length} sem. Creado: {new Date(routine.start_date).toLocaleDateString()}</span>
        </div>
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

                    // Expanded Table View
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
                          <div style={{ flex: 1, textAlign: 'center' }}>RPE</div>
                          <div style={{ flex: 1, textAlign: 'center' }}>TIPO</div>
                          <div style={{ width: '2rem', textAlign: 'center' }}>✓</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {ex.sets?.map((set: any, sIdx: number) => (
                            <div key={set.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid var(--surface-hover)' }}>
                              <div style={{ width: '2rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                                💬
                              </div>
                              <div style={{ flex: 2, paddingRight: '1rem' }}>
                                <input type="number" placeholder="kg" defaultValue={set.weight} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                              </div>
                              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>{set.reps}</div>
                              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>{set.rpe}</div>
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
    </div>
  );
}
