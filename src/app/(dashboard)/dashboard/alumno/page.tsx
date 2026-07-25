"use client";

import { useState, useEffect } from "react";
import AnamnesisForm from "@/components/forms/AnamnesisForm";
import LogoutButton from "@/components/ui/LogoutButton";

export default function AlumnoDashboard() {
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("entreno");

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
        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', minHeight: '80vh' }}>
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

  useEffect(() => {
    fetch('/api/alumno/routine').then(r => r.json()).then(setRoutine);
  }, []);

  if (!routine || routine.error) return <p style={{color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '2rem'}}>Tu profesor aún no te ha asignado una rutina.</p>;

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
                          <div style={{ flex: 1, textAlign: 'center' }}>PROF.</div>
                          <div style={{ flex: 1.5, textAlign: 'center' }}>ASESORADO</div>
                          <div style={{ flex: 1, textAlign: 'center' }}>TIPO</div>
                          <div style={{ width: '2rem', textAlign: 'center' }}>✓</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {ex.sets?.map((set: any, sIdx: number) => (
                            <div key={set.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid var(--surface-hover)' }}>
                              <div style={{ width: '2rem', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                                💬
                              </div>
                              <div style={{ flex: 2, paddingRight: '0.5rem' }}>
                                <input type="number" placeholder="kg" defaultValue={set.weight} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                              </div>
                              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>{set.reps}</div>
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
    </div>
  );
}

function ProgressViewer() {
  return (
    <div>
      <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tu Progreso</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>12</div>
          <div style={{ color: 'var(--foreground-muted)' }}>Días Entrenados</div>
        </div>
        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>3</div>
          <div style={{ color: 'var(--foreground-muted)' }}>Semanas de Racha</div>
        </div>
        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>85%</div>
          <div style={{ color: 'var(--foreground-muted)' }}>Cumplimiento</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--background)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--foreground-muted)' }}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</span>
        <p>El calendario de asistencia estará disponible muy pronto.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>¡Sigue registrando tus entrenamientos!</p>
      </div>
    </div>
  );
}

function MetricsViewer() {
  return (
    <div>
      <h2 style={{ color: 'var(--neon-green)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tus Métricas y Récords</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>Sentadilla Libre</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>100</span>
            <span style={{ color: 'var(--foreground-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>PR histórico - hace 2 semanas</div>
        </div>

        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>Peso Muerto</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>120</span>
            <span style={{ color: 'var(--foreground-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>PR histórico - hace 1 mes</div>
        </div>

        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>Press Banca</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>80</span>
            <span style={{ color: 'var(--foreground-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>PR histórico - la semana pasada</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: 'var(--background)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--foreground-muted)' }}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📊</span>
        <p>Los gráficos de volumen y evolución de cargas están en desarrollo.</p>
      </div>
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
        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--neon-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Datos Físicos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Edad:</span> <strong>{anamnesis.age ? `${anamnesis.age} años` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Peso:</span> <strong>{anamnesis.current_weight ? `${anamnesis.current_weight} kg` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Altura:</span> <strong>{anamnesis.height ? `${anamnesis.height} cm` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Nutricionista:</span> <strong>{anamnesis.sees_nutritionist ? 'Sí' : 'No'}</strong></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
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

        <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
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
