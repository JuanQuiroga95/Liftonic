"use client";

import { useState, useEffect } from "react";
import AnamnesisForm from "@/components/forms/AnamnesisForm";

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
        <AnamnesisForm onComplete={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <h1 style={{color: 'var(--neon-fuchsia)', fontSize: '2rem', marginBottom: '2rem'}}>Mi Entrenamiento</h1>
      
      <div style={{backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)'}}>
        <h2 style={{color: 'var(--neon-blue)', marginBottom: '1rem'}}>Rutina Activa</h2>
        <RoutineViewer />
      </div>
    </div>
  );
}

function RoutineViewer() {
  const [routine, setRoutine] = useState<any>(null);

  useEffect(() => {
    fetch('/api/alumno/routine').then(r => r.json()).then(setRoutine);
  }, []);

  if (!routine) return <p style={{color: 'var(--foreground-muted)'}}>Tu profesor aún no te ha asignado una rutina.</p>;

  return (
    <div>
      <h3>{routine.title}</h3>
      <p style={{color: 'var(--foreground-muted)', marginBottom: '2rem'}}>
        Del {new Date(routine.start_date).toLocaleDateString()} al {new Date(routine.end_date).toLocaleDateString()}
      </p>

      {routine.weeks?.map((week: any) => (
        <div key={week.id} style={{marginBottom: '2rem'}}>
          <h4 style={{color: 'var(--neon-pink)', marginBottom: '1rem'}}>Semana {week.week_number}</h4>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            {week.days?.map((day: any) => (
              <div key={day.id} style={{backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', minWidth: '300px', border: '1px solid var(--border)'}}>
                <h5 style={{marginBottom: '1rem', fontSize: '1.2rem'}}>{day.day_name}</h5>
                {day.exercises?.map((ex: any) => (
                  <div key={ex.id} style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-hover)'}}>
                    <strong>{ex.exercise_name}</strong>
                    <div style={{fontSize: '0.875rem', color: 'var(--foreground-muted)', marginTop: '0.25rem'}}>
                      Objetivo: {ex.target_sets} series x {ex.target_reps} ({ex.target_weight}kg)
                    </div>
                    {ex.media && ex.media[0] && (
                      <a href={ex.media[0].url} target="_blank" style={{color: 'var(--neon-blue)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem'}}>Ver Ejercicio</a>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
