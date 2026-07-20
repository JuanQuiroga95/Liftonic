"use client";

import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

type ExerciseBlock = {
  id: string;
  exercise_id: string;
  target_sets: number;
  target_reps: string;
  target_weight: number;
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

export default function RoutineBuilder({ students, exercises }: { students: any[], exercises: any[] }) {
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [weeks, setWeeks] = useState<RoutineWeek[]>([
    { id: uuidv4(), week_number: 1, days: [] }
  ]);

  const [saving, setSaving] = useState(false);

  const addWeek = () => {
    setWeeks([...weeks, { id: uuidv4(), week_number: weeks.length + 1, days: [] }]);
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
    if (exercises.length === 0) return alert("Primero debes crear ejercicios en la biblioteca.");
    
    setWeeks(weeks.map(w => {
      if (w.id === weekId) {
        return {
          ...w, days: w.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d, exercises: [...d.exercises, {
                  id: uuidv4(),
                  exercise_id: exercises[0].id,
                  target_sets: 4,
                  target_reps: "10",
                  target_weight: 0
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
    
    setSaving(true);
    try {
      const res = await fetch("/api/profesor/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, title, start_date: startDate, end_date: endDate, weeks }),
      });
      if (res.ok) {
        alert("Rutina guardada y asignada exitosamente.");
        // Reset form
        setTitle(""); setStudentId(""); setWeeks([{ id: uuidv4(), week_number: 1, days: [] }]);
      } else {
        alert("Error al guardar la rutina.");
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
              <button onClick={() => addDay(week.id)} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--neon-blue)', border: '1px solid var(--neon-blue)', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Agregar Día</button>
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
                          <button onClick={() => removeExercise(week.id, day.id, ex.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.75rem' }}>X</button>
                        </div>
                        <select 
                          value={ex.exercise_id}
                          onChange={e => updateExercise(week.id, day.id, ex.id, 'exercise_id', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)' }}
                        >
                          {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="number" placeholder="Series" value={ex.target_sets} onChange={e => updateExercise(week.id, day.id, ex.id, 'target_sets', parseInt(e.target.value))} style={{ width: '33%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)' }} title="Series" />
                          <input type="text" placeholder="Reps" value={ex.target_reps} onChange={e => updateExercise(week.id, day.id, ex.id, 'target_reps', e.target.value)} style={{ width: '33%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)' }} title="Repeticiones (Ej: 10, 8-10, Fallo)" />
                          <input type="number" placeholder="Kg" value={ex.target_weight} onChange={e => updateExercise(week.id, day.id, ex.id, 'target_weight', parseFloat(e.target.value))} style={{ width: '33%', padding: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--foreground)' }} title="Peso Objetivo (kg)" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => addExercise(week.id, day.id)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0, 229, 255, 0.1)', color: 'var(--neon-blue)', border: '1px dashed var(--neon-blue)', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    + Agregar Ejercicio
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={addWeek} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Agregar Semana</button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--neon-fuchsia)', color: 'var(--background)', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
          {saving ? 'Guardando Rutina...' : 'Guardar y Asignar Rutina'}
        </button>
      </div>

    </div>
  );
}
