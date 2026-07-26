"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

type ExerciseSet = {
  id: string;
  reps: number;
  rpe: number;
  weight: number;
  type: string;
};

type ExerciseBlock = {
  id: string;
  exercise_id: string;
  sets: ExerciseSet[];
};

type RoutineDay = {
  id: string;
  day_name: string;
  exercises: ExerciseBlock[];
};

type RoutineWeek = {
  id: string;
  week_number: number;
  days: RoutineDay[];
};

import { useRef } from "react";

function ExerciseAutocomplete({ 
  exercises, 
  value, 
  onChange, 
  onRefreshExercises 
}: { 
  exercises: any[], 
  value: string, 
  onChange: (id: string) => void,
  onRefreshExercises: () => void 
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // New exercise state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVar, setNewVar] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize search with current value if exists
  useEffect(() => {
    if (value) {
      const ex = exercises.find(e => e.id === value);
      if (ex) setSearch(ex.name + (ex.variation ? ` (${ex.variation})` : ''));
    } else {
      setSearch("");
    }
  }, [value, exercises]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = exercises.filter(e => 
    (e.name + " " + (e.variation || "")).toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profesor/exercises', {
        method: "POST",
        body: JSON.stringify({ name: newName, description: newDesc, variation: newVar, media: [] })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        onRefreshExercises();
        onChange(data.id);
        setSearch(newName + (newVar ? ` (${newVar})` : ''));
        setIsCreating(false);
        setIsOpen(false);
      } else {
        alert(data.error || "Error al crear ejercicio en el servidor");
      }
    } catch (err: any) {
      alert("Error de conexión al crear ejercicio: " + err.message);
    }
    setSaving(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
    setIsOpen(false);
  };

  if (isCreating) {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--neon-blue)' }}>Crear Nuevo Ejercicio</h4>
        <input placeholder="Nombre" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', color: 'var(--foreground)' }} />
        <input placeholder="Variación (Opcional)" value={newVar} onChange={e => setNewVar(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', color: 'var(--foreground)' }} />
        <textarea placeholder="Descripción (Opcional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', color: 'var(--foreground)' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={() => setIsCreating(false)} style={{ flex: 1 }}>Cancelar</button>
          <button className="btn-primary" onClick={handleCreate} disabled={saving} style={{ flex: 1, backgroundColor: 'var(--neon-blue)' }}>{saving ? 'Guardando...' : 'Crear y Usar'}</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '0.5rem' }}>
      <div style={{ position: 'relative' }}>
        <input 
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar o crear ejercicio..."
          style={{ width: '100%', padding: '0.5rem', paddingRight: '2rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)' }}
        />
        {value && (
          <button 
            onClick={handleClear}
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0' }}
          >
            ×
          </button>
        )}
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 10, width: '100%', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', marginTop: '0.25rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          {filtered.length > 0 ? (
            filtered.map(e => (
              <div 
                key={e.id} 
                onClick={() => { onChange(e.id); setIsOpen(false); setSearch(e.name + (e.variation ? ` (${e.variation})` : '')); }}
                style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
              >
                {e.name} {e.variation && <span style={{ color: 'var(--neon-blue)', fontSize: '0.75rem' }}>({e.variation})</span>}
              </div>
            ))
          ) : (
            <div style={{ padding: '0.5rem', color: 'var(--foreground-muted)' }}>No se encontraron ejercicios.</div>
          )}
          <div 
            onClick={() => { setIsCreating(true); setNewName(search); setIsOpen(false); }}
            style={{ padding: '0.5rem', cursor: 'pointer', backgroundColor: 'rgba(255, 0, 128, 0.1)', color: 'var(--neon-fuchsia)', fontWeight: 'bold', textAlign: 'center' }}
          >
            + Crear nuevo ejercicio
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoutineBuilder({ 
  students, 
  exercises, 
  onRefreshExercises,
  initialRoutine,
  onCancelEdit
}: { 
  students: any[], 
  exercises: any[], 
  onRefreshExercises: () => void,
  initialRoutine?: any,
  onCancelEdit?: () => void
}) {
  const [studentId, setStudentId] = useState(initialRoutine?.student_id || "");
  const [title, setTitle] = useState(initialRoutine?.title || "");
  const [startDate, setStartDate] = useState(initialRoutine?.start_date ? new Date(initialRoutine.start_date).toISOString().split('T')[0] : "");
  const [endDate, setEndDate] = useState(initialRoutine?.end_date ? new Date(initialRoutine.end_date).toISOString().split('T')[0] : "");
  
  const [weeks, setWeeks] = useState<RoutineWeek[]>(initialRoutine?.weeks || [
    { id: uuidv4(), week_number: 1, days: [] }
  ]);

  const [saving, setSaving] = useState(false);

  const addWeek = () => {
    setWeeks([...weeks, { id: uuidv4(), week_number: weeks.length + 1, days: [] }]);
  };

  const duplicateWeek = (weekToCopyId: string) => {
    const weekToCopy = weeks.find(w => w.id === weekToCopyId);
    if (!weekToCopy) return;

    const newWeek: RoutineWeek = {
      id: uuidv4(),
      week_number: weeks.length + 1,
      days: weekToCopy.days.map(day => ({
        ...day,
        id: uuidv4(),
        exercises: day.exercises.map(ex => ({
          ...ex,
          id: uuidv4(),
          sets: ex.sets.map(set => ({
            ...set,
            id: uuidv4()
          }))
        }))
      }))
    };

    setWeeks([...weeks, newWeek]);
  };

  const addDay = (weekId: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return { ...w, days: [...w.days, { id: uuidv4(), day_name: "Nuevo Día", exercises: [] }] };
      }
      return w;
    }));
  };

  const updateDayName = (weekId: string, dayId: string, name: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return { ...w, days: w.days.map(d => d.id === dayId ? { ...d, day_name: name } : d) };
      }
      return w;
    }));
  };

  const addExercise = (weekId: string, dayId: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: [...d.exercises, {
                  id: uuidv4(),
                  exercise_id: exercises.length > 0 ? exercises[0].id : "",
                  sets: [{ id: uuidv4(), reps: 1, rpe: 8, weight: 0, type: "Top" }]
                }]
              };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const updateExercise = (weekId: string, dayId: string, exId: string, field: string, value: any) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
              };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const addSet = (weekId: string, dayId: string, exId: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: d.exercises.map(e => {
                  if (e.id === exId) {
                    const lastSet = e.sets[e.sets.length - 1];
                    return {
                      ...e,
                      sets: [...(e.sets || []), { 
                        id: uuidv4(), 
                        reps: lastSet ? lastSet.reps : 1, 
                        rpe: lastSet ? lastSet.rpe : 8, 
                        weight: lastSet ? lastSet.weight : 0, 
                        type: "Back" 
                      }]
                    };
                  }
                  return e;
                })
              };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const updateSet = (weekId: string, dayId: string, exId: string, setId: string, field: string, value: any) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: d.exercises.map(e => {
                  if (e.id === exId) {
                    return {
                      ...e,
                      sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
                    };
                  }
                  return e;
                })
              };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const removeSet = (weekId: string, dayId: string, exId: string, setId: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: d.exercises.map(e => {
                  if (e.id === exId) {
                    return { ...e, sets: e.sets.filter(s => s.id !== setId) };
                  }
                  return e;
                })
              };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const removeExercise = (weekId: string, dayId: string, exId: string) => {
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return { ...d, exercises: d.exercises.filter(e => e.id !== exId) };
            }
            return d;
          })
        };
      }
      return w;
    }));
  };

  const handleSave = async () => {
    if (!studentId || !title || !startDate || !endDate) return alert("Completa la información general (Alumno, Título, Fechas).");
    
    // Validate all exercises have an ID
    const hasEmptyEx = weeks.some(w => w.days.some(d => d.exercises.some(e => !e.exercise_id)));
    if (hasEmptyEx) return alert("Todos los ejercicios deben estar asignados.");

    setSaving(true);
    try {
      const isEditing = !!initialRoutine?.id;
      const url = isEditing ? `/api/profesor/routines/${initialRoutine.id}` : "/api/profesor/routines";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, title, start_date: startDate, end_date: endDate, weeks }),
      });
      if (res.ok) {
        alert(isEditing ? "Rutina actualizada exitosamente." : "Rutina guardada y asignada exitosamente.");
        if (isEditing && onCancelEdit) {
          onCancelEdit();
        } else if (!isEditing) {
          setTitle(""); setStudentId(""); setWeeks([{ id: uuidv4(), week_number: 1, days: [] }]);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al guardar la rutina.");
      }
    } catch (err) {
      alert("Error de conexión");
    }
    setSaving(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Constructor de Rutinas Avanzado</h2>
      
      {/* Configuración General */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>Asignar a Alumno</label>
          <select value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}>
            <option value="">Selecciona un alumno...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.username})</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>Título de la Rutina</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Hipertrofia Fase 1" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>Fecha Inicio</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>Fecha Fin</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }} />
        </div>
      </div>

      {/* Constructor Visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
        {weeks.map((week, wIndex) => (
          <div key={week.id} style={{ padding: '1.5rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--neon-pink)', margin: 0 }}>Semana {wIndex + 1}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-outline-blue" onClick={() => addDay(week.id)}>+ Agregar Día</button>
                <button className="btn-ghost" onClick={() => duplicateWeek(week.id)} style={{ color: 'var(--foreground)' }} title="Duplicar esta semana al final">Duplicar Semana</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {week.days.length === 0 && <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>No hay días en esta semana. Agrega uno.</p>}
              {week.days.map((day) => (
                <div key={day.id} style={{ minWidth: '350px', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <input 
                    value={day.day_name} 
                    onChange={e => updateDayName(week.id, day.id, e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', fontWeight: 'bold' }} 
                  />
                  
                  {/* Ejercicios del día */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    {day.exercises.map((ex, eIndex) => (
                      <div key={ex.id} style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--surface-hover)', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Ejercicio {eIndex + 1}</span>
                          <button className="btn-ghost" onClick={() => removeExercise(week.id, day.id, ex.id)} style={{ color: '#ff4d4d', padding: '0.25rem' }}>X</button>
                        </div>
                        
                        <ExerciseAutocomplete 
                          exercises={exercises} 
                          value={ex.exercise_id} 
                          onChange={(id) => updateExercise(week.id, day.id, ex.id, 'exercise_id', id)}
                          onRefreshExercises={onRefreshExercises}
                        />

                        {/* Tabla de Series */}
                        <div style={{ marginTop: '1rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <div className="routine-grid-header" style={{ padding: '0.5rem', backgroundColor: 'var(--surface-hover)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--foreground-muted)' }}>
                            <div style={{ textAlign: 'center' }}>#</div>
                            <div style={{ textAlign: 'center' }}>REPS</div>
                            <div style={{ textAlign: 'center' }}>PROF. RPE</div>
                            <div style={{ textAlign: 'center' }}>ALU. RPE</div>
                            <div style={{ textAlign: 'center' }}>KG Obj.</div>
                            <div style={{ textAlign: 'center' }}>TIPO</div>
                            <div style={{ textAlign: 'center' }}></div>
                          </div>
                          
                          {ex.sets?.map((set: any, sIndex: number) => (
                            <div key={set.id} className="routine-grid-row" style={{ borderTop: '1px solid var(--border)' }}>
                              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>{sIndex + 1}</div>
                              <div>
                                <input type="number" placeholder="reps" value={set.reps} onChange={e => updateSet(week.id, day.id, ex.id, set.id, 'reps', parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                              </div>
                              <div>
                                <input type="number" placeholder="rpe" value={set.rpe} onChange={e => updateSet(week.id, day.id, ex.id, set.id, 'rpe', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                              </div>
                              <div>
                                <input type="text" disabled placeholder="-" style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--background)', border: '1px dashed var(--border)', borderRadius: '0.25rem', color: 'var(--foreground-muted)', textAlign: 'center', cursor: 'not-allowed' }} title="El alumno llenará esto" />
                              </div>
                              <div>
                                <input type="number" placeholder="kg" value={set.weight} onChange={e => updateSet(week.id, day.id, ex.id, set.id, 'weight', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)', textAlign: 'center' }} />
                              </div>
                              <div>
                                <select value={set.type} onChange={e => updateSet(week.id, day.id, ex.id, set.id, 'type', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: set.type === 'Top' ? 'var(--neon-pink)' : (set.type === 'Back' ? '#f59e0b' : 'var(--foreground)') }}>
                                  <option value="Normal">Normal</option>
                                  <option value="Top" style={{ color: 'var(--neon-pink)' }}>Top</option>
                                  <option value="Back" style={{ color: '#f59e0b' }}>Back</option>
                                </select>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <button className="btn-ghost" onClick={() => removeSet(week.id, day.id, ex.id, set.id)} style={{ color: '#ff4d4d', padding: '0.25rem' }}>×</button>
                              </div>
                            </div>
                          ))}
                          <button className="btn-ghost" onClick={() => addSet(week.id, day.id, ex.id)} style={{ width: '100%', borderTop: '1px dashed var(--border)', borderRadius: 0, padding: '0.75rem' }}>
                            + Añadir Serie
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn-outline-blue" onClick={() => addExercise(week.id, day.id)} style={{ width: '100%', borderStyle: 'dashed', backgroundColor: 'rgba(0, 229, 255, 0.05)' }}>
                    + Añadir Ejercicio
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-ghost" onClick={addWeek}>+ Agregar Semana</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {initialRoutine && onCancelEdit && (
            <button className="btn-ghost" onClick={onCancelEdit} disabled={saving} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
              Cancelar Edición
            </button>
          )}
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            {saving ? 'Guardando...' : (initialRoutine ? 'Actualizar Rutina' : 'Guardar y Finalizar Rutina')}
          </button>
        </div>
      </div>

    </div>
  );
}
