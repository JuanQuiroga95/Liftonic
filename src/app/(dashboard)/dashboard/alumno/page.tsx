"use client";

import { useState, useEffect, useRef } from "react";
import AnamnesisForm from "@/components/forms/AnamnesisForm";
import LogoutButton from "@/components/ui/LogoutButton";
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from "next-auth/react";
import { Dumbbell, TrendingUp, ChartColumn, User, LogOut, Flame, CalendarDays, CircleCheck, CirclePlay, Check, ChevronDown, CircleHelp } from 'lucide-react';

const getStreakInfo = (weeks: number) => {
  if (weeks >= 48) return { icon: '👑', label: 'Leyenda', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
  if (weeks >= 24) return { icon: '💎', label: 'Diamante', color: 'var(--neon-blue)', bg: 'rgba(0, 229, 255, 0.1)' };
  if (weeks >= 12) return { icon: '🦍', label: 'Gorila', color: 'var(--neon-pink)', bg: 'rgba(255, 0, 128, 0.1)' };
  if (weeks >= 8) return { icon: '⚡', label: 'Rayo', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
  if (weeks >= 4) return { icon: '🔥', label: 'Fuego', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  if (weeks >= 3) return { icon: '🌳', label: 'Árbol', color: 'var(--neon-green)', bg: 'rgba(0, 255, 136, 0.1)' };
  if (weeks >= 2) return { icon: '🍃', label: 'Hojas', color: 'var(--neon-green)', bg: 'rgba(0, 255, 136, 0.1)' };
  if (weeks >= 1) return { icon: '🌿', label: 'Brote', color: 'var(--neon-green)', bg: 'rgba(0, 255, 136, 0.1)' };
  return { icon: '🌱', label: 'Semilla', color: 'var(--foreground-muted)', bg: 'var(--surface-hover)' };
};

const NAV_TABS = [
  { id: "entreno", label: "Entreno", Icon: Dumbbell },
  { id: "progreso", label: "Progreso", Icon: TrendingUp },
  { id: "metricas", label: "Métricas", Icon: ChartColumn },
  { id: "perfil", label: "Perfil", Icon: User },
];

export default function AlumnoDashboard() {
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("entreno");
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/alumno/anamnesis').then(r => r.json()),
      fetch('/api/alumno/profile').then(r => r.json()),
      fetch('/api/alumno/progress').then(r => r.json())
    ]).then(([anamnesisData, profileData, progressData]) => {
      setAnamnesis(anamnesisData);
      setProfile(profileData);
      setProgress(progressData);
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

  const changeTab = (id: string) => {
    setActiveTab(id);
    // body is the scroll container (html/body height: 100%), window as fallback
    document.body.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => signOut({ callbackUrl: '/login' });

  const firstName = profile?.name?.split(' ')[0] || '';
  const initial = (firstName[0] || '?').toUpperCase();
  const streakInfo = progress ? getStreakInfo(progress.streak || 0) : null;

  return (
    <div className="app-shell">
      {/* Sidebar (desktop): fija, siempre visible */}
      <aside className="app-sidebar">
        <div className="app-brand">LIFTONIC</div>
        <nav className="app-nav">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`app-nav-item${activeTab === id ? ' is-active' : ''}`}
              onClick={() => changeTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="app-sidebar-foot">
          <div className="app-user">
            <span className="app-avatar">{initial}</span>
            <span className="app-user-name">{profile?.name}</span>
          </div>
          <button className="app-nav-item app-logout" onClick={handleLogout}>
            <LogOut size={20} strokeWidth={2} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Barra superior (móvil): marca + salir siempre a mano */}
      <header className="app-topbar">
        <div className="app-brand">LIFTONIC</div>
        <button className="app-topbar-logout" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} strokeWidth={2} />
          <span>Salir</span>
        </button>
      </header>

      <main className="app-main">
        {profile && (
          <div className="app-greeting">
            <div style={{ minWidth: 0 }}>
              <h1>Hola, {firstName}</h1>
              <p>
                {progress?.streak > 0
                  ? "Seguimos sumando semanas. ¡Vamos!"
                  : "Este es tu espacio de entrenamiento."}
              </p>
            </div>

            {progress && streakInfo && (
              <div className="app-streak" style={{ borderColor: streakInfo.color === 'var(--foreground-muted)' ? 'var(--border)' : streakInfo.color }}>
                <Flame size={18} strokeWidth={2.25} color={streakInfo.color === 'var(--foreground-muted)' ? 'currentColor' : streakInfo.color} />
                <div>
                  <strong>{progress.streak || 0} {progress.streak === 1 ? 'semana' : 'semanas'}</strong>
                  <span>Racha · {streakInfo.label}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="app-panel">
          {renderTabContent()}
        </div>
      </main>

      {/* Tab bar inferior (móvil) */}
      <nav className="app-tabbar" aria-label="Secciones">
        {NAV_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`app-tab${activeTab === id ? ' is-active' : ''}`}
            onClick={() => changeTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function RoutineViewer() {
  const [routine, setRoutine] = useState<any>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState<any>(null);

  // Gamification States
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [setWeights, setSetWeights] = useState<Record<string, number>>({});
  const [setRpes, setSetRpes] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [prEvent, setPrEvent] = useState<{ exercise: string, weight: number } | null>(null);
  const [celebrationEvent, setCelebrationEvent] = useState<{ trainedDays: number } | null>(null);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('liftonic_completedSets');
      if (savedCompleted) setCompletedSets(JSON.parse(savedCompleted));
      
      const savedWeights = localStorage.getItem('liftonic_setWeights');
      if (savedWeights) setSetWeights(JSON.parse(savedWeights));

      const savedRpes = localStorage.getItem('liftonic_setRpes');
      if (savedRpes) setSetRpes(JSON.parse(savedRpes));
    } catch (e) {
      console.error('Error loading from local storage', e);
    }

    fetch('/api/alumno/routine').then(r => r.json()).then(data => {
      setRoutine(data);
      if (data && data.weeks) {
        // Find the first week that has at least one day NOT saved
        const isDaySaved = (day: any) => day?.exercises?.some((ex: any) => ex.actual_weight !== null && ex.actual_weight !== undefined);
        const currentWeekIdx = data.weeks.findIndex((w: any) => w.days.some((d: any) => !isDaySaved(d)));
        if (currentWeekIdx !== -1) setActiveWeekIndex(currentWeekIdx);
      }
    });
    fetch('/api/alumno/metrics').then(r => r.json()).then(data => setMetrics(data || []));
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
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

  const toNumber = (v: any) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  // "10-12" or "10 al fallo" -> 10 (lower bound, used for volume estimates)
  const parseReps = (reps: any) => {
    const m = String(reps ?? '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

  const formatKg = (kg: number) => (Number.isInteger(kg) ? String(kg) : kg.toFixed(1));

  const formatRange = (values: number[], suffix = '') => {
    if (values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? `${formatKg(min)}${suffix}` : `${formatKg(min)}–${formatKg(max)}${suffix}`;
  };

  // Compact chips describing the whole exercise: "3 series", "8-10 reps", "RPE 7–8", "60 kg"
  const summarizeExercise = (sets: any[]) => {
    if (!sets || sets.length === 0) return [];
    const reps = Array.from(new Set(sets.map(s => String(s.reps ?? '').trim()).filter(Boolean)));
    const rpes = sets.map(s => toNumber(s.rpe)).filter(n => n > 0);
    const weights = sets.map(s => toNumber(s.weight)).filter(n => n > 0);
    const chips: { text: string, kg?: boolean }[] = [{ text: `${sets.length} ${sets.length === 1 ? 'serie' : 'series'}` }];
    if (reps.length) chips.push({ text: `${reps.length <= 2 ? reps.join(' / ') : formatRange(reps.map(parseReps))} reps` });
    if (rpes.length) chips.push({ text: `RPE ${formatRange(rpes)}` });
    if (weights.length) chips.push({ text: formatRange(weights, ' kg'), kg: true });
    return chips;
  };

  const getSetWeight = (set: any) => setWeights[set.id] ?? toNumber(set.weight);

  const handleCheckSet = (ex: any, set: any, isChecked: boolean) => {
    setCompletedSets(prev => {
      const updated = { ...prev, [set.id]: isChecked };
      localStorage.setItem('liftonic_completedSets', JSON.stringify(updated));
      return updated;
    });
    
    if (isChecked) {
      const currentWeight = getSetWeight(set);
      const exMetrics = metrics.find(m => m.exercise === ex.exercise_name);
      const prevMax = exMetrics?.pr || set.weight; 
      
      // Check PR condition (must be > prevMax and at least realistic weight > 0)
      if (currentWeight > prevMax && currentWeight > 0) {
        setPrEvent({ exercise: ex.exercise_name, weight: currentWeight });
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setPrEvent(null);
        }, 5000);
      }
    }
  };

  // null clears the override so the prescribed weight shows again
  const updateSetWeight = (setId: string, value: number | null) => {
    setSetWeights(prev => {
      const updated = { ...prev };
      if (value === null || !Number.isFinite(value)) delete updated[setId];
      else updated[setId] = Math.max(0, Math.round(value * 100) / 100);
      localStorage.setItem('liftonic_setWeights', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSetRpe = (setId: string, value: string) => {
    setSetRpes(prev => {
      const updated = { ...prev, [setId]: value };
      localStorage.setItem('liftonic_setRpes', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFinishWorkout = async (day: any) => {
    setSavingWorkout(true);
    try {
      const exercises = day.exercises.map((ex: any) => {
        let maxWeight = 0;
        ex.sets.forEach((set: any) => {
          if (completedSets[set.id]) {
            const w = getSetWeight(set);
            if (w > maxWeight) maxWeight = w;
          }
        });
        return { id: ex.id, weight: maxWeight };
      });

      const res = await fetch('/api/alumno/routine/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises })
      });

      if (res.ok) {
        const newProgress = await fetch('/api/alumno/progress').then(r => r.json());
        setCelebrationEvent({ trainedDays: newProgress.trainedDays });
        setShowConfetti(true);
        // Clear local storage on successful save
        localStorage.removeItem('liftonic_completedSets');
        localStorage.removeItem('liftonic_setWeights');
        localStorage.removeItem('liftonic_setRpes');
        setCompletedSets({});
        setSetWeights({});
        setSetRpes({});
      } else {
        alert('Hubo un error al guardar tu entrenamiento.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión.');
    } finally {
      setSavingWorkout(false);
    }
  };

  const isDayAlreadySaved = (day: any) => {
    if (!day || !day.exercises) return false;
    return day.exercises.some((ex: any) => ex.actual_weight !== null && ex.actual_weight !== undefined);
  };

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];
  
  let todayLabel = "Hoy toca descanso";
  let todayDetail = "";
  let todayRoutine: any = null;
  if (activeWeek && activeWeek.days) {
    todayRoutine = activeWeek.days.find((d: any) => d.day_name.toLowerCase().includes(todayName.toLowerCase()));
    if (todayRoutine) {
      todayLabel = "Hoy entrenás";
      todayDetail = todayRoutine.day_name;
    } else if (activeWeek.days.length > 0) {
      todayRoutine = activeWeek.days.find((d: any) => !isDayAlreadySaved(d)) || activeWeek.days[0];
      todayLabel = "Próximo entreno";
      todayDetail = todayRoutine.day_name;
    }
  }

  // Helper to check if a specific day has at least one set completed
  const isDayCompleted = (day: any) => {
    if (!day || !day.exercises || day.exercises.length === 0) return false;
    const allSets = day.exercises.flatMap((e: any) => e.sets);
    if (allSets.length === 0) return false;
    return allSets.some((s: any) => completedSets[s.id]);
  };

  // Volume = weight x reps of the sets actually completed
  const getDayStats = (day: any) => {
    const allSets = (day?.exercises || []).flatMap((e: any) => e.sets || []);
    const done = allSets.filter((s: any) => completedSets[s.id]);
    const volume = done.reduce((sum: number, s: any) => sum + getSetWeight(s) * parseReps(s.reps), 0);
    return { total: allSets.length, done: done.length, volume: Math.round(volume) };
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} recycle={false} numberOfPieces={500} />}
      
      <AnimatePresence>
        {prEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'none' }}>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: [1, 1.2, 1], opacity: 1 }} 
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ 
                backgroundColor: 'var(--surface)', padding: '2.5rem', borderRadius: '1rem', 
                border: '2px solid var(--neon-pink)', boxShadow: '0 0 40px rgba(255, 0, 128, 0.5)', textAlign: 'center',
                minWidth: '280px'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💪🔥</div>
              <h2 style={{ color: 'var(--foreground)', margin: 0, fontSize: '1.75rem', textTransform: 'uppercase' }}>¡NUEVO RÉCORD!</h2>
              <p style={{ color: 'var(--neon-pink)', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{prEvent.weight} kg en {prEvent.exercise}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Celebración de Entrenamiento Terminado */}
      <AnimatePresence>
        {celebrationEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: [1, 1.1, 1], opacity: 1 }} 
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ 
                backgroundColor: 'var(--surface)', padding: '3rem 2rem', borderRadius: '1rem', 
                border: '2px solid var(--neon-green)', boxShadow: '0 0 50px rgba(0, 255, 136, 0.4)', textAlign: 'center',
                minWidth: '300px'
              }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏆</div>
              <h2 style={{ color: 'var(--foreground)', margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>¡FELICIDADES!</h2>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '2rem' }}>
                Entrenamiento guardado con éxito.
              </p>
              <div style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed var(--neon-green)' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--neon-green)', fontWeight: '900' }}>{celebrationEvent.trainedDays}</span>
                <div style={{ color: 'var(--foreground)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem', marginTop: '0.5rem' }}>Días Entrenados Total</div>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => { setCelebrationEvent(null); setShowConfetti(false); window.location.reload(); }}
                style={{ marginTop: '2rem', width: '100%', padding: '1rem', backgroundColor: 'var(--neon-green)', color: '#000', fontWeight: 'bold', border: 'none' }}
              >
                Seguir Rompiéndola
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="rt-head">
        <div style={{ minWidth: 0 }}>
          <span className="rt-eyebrow">Tu rutina</span>
          <h2>{routine.title}</h2>
          <span className="rt-meta">
            {routine.weeks?.length} {routine.weeks?.length === 1 ? 'semana' : 'semanas'} · desde {new Date(routine.start_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      <div className="rt-today">
        <CalendarDays size={20} strokeWidth={2} />
        <div style={{ minWidth: 0 }}>
          <span>{todayLabel}</span>
          {todayDetail && <strong>{todayDetail}</strong>}
        </div>
      </div>

      {/* Week Selector Scroll */}
      {routine.weeks?.length > 1 && (
        <div className="rt-weeks" role="tablist" aria-label="Semanas">
          {routine.weeks?.map((week: any, idx: number) => (
            <button
              key={week.id}
              role="tab"
              aria-selected={idx === activeWeekIndex}
              className={`rt-week${idx === activeWeekIndex ? ' is-active' : ''}`}
              onClick={() => setActiveWeekIndex(idx)}
            >
              Semana {week.week_number}
            </button>
          ))}
        </div>
      )}

      {/* Active Week Days */}
      {activeWeek && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeWeek.days?.map((day: any) => (
            <section key={day.id} className="rt-day">
              <div className="rt-day-head">
                <span className={`rt-day-icon${isDayAlreadySaved(day) || isDayCompleted(day) ? ' is-done' : ''}`}>
                  {isDayAlreadySaved(day) || isDayCompleted(day) ? <Check size={18} strokeWidth={3} /> : <Dumbbell size={18} strokeWidth={2} />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3>{day.day_name}</h3>
                  <span>{day.exercises?.length || 0} ejercicios</span>
                </div>
              </div>

              <div className="rt-day-body">
                {isDayAlreadySaved(day) ? (
                  <div className="rt-saved">
                    <CircleCheck size={40} strokeWidth={1.75} />
                    <h4>Entrenamiento listo</h4>
                    <p>Este día ya quedó guardado en tu progreso.</p>
                  </div>
                ) : (
                  <>
                    <details className="wk-help">
                      <summary><CircleHelp size={16} strokeWidth={2} /> Cómo leer tu rutina</summary>
                      <ul>
                        <li><b>Objetivo:</b> repeticiones y esfuerzo que te indicó tu profe.</li>
                        <li><b>Peso usado:</b> lo que levantaste. Ajustalo con − / + (2,5 kg).</li>
                        <li><b>RPE:</b> esfuerzo del 1 al 10. RPE 8 ≈ te quedan 2 repeticiones.</li>
                        {day.exercises?.some((e: any) => e.sets?.some((s: any) => s.type === 'Top' || s.type === 'Back')) && (
                          <li><b>Top</b> = serie más pesada · <b>Back</b> = series de descarga, con menos peso.</li>
                        )}
                      </ul>
                    </details>

                    <motion.div
                      className="wk-list"
                      initial="hidden" animate="show"
                      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                    >
                      {day.exercises?.map((ex: any, exIdx: number) => {
                        const isExpanded = !!expandedExercises[ex.id];
                        const sets = ex.sets || [];
                        const doneCount = sets.filter((s: any) => completedSets[s.id]).length;
                        const allDone = sets.length > 0 && doneCount === sets.length;

                        return (
                          <motion.div
                            key={ex.id}
                            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                            className={`wk-card${isExpanded ? ' is-open' : ''}${allDone ? ' is-done' : ''}`}
                          >
                            <button className="wk-card-head" onClick={() => toggleExercise(ex.id)} aria-expanded={isExpanded}>
                              <span className="wk-num">{allDone ? <Check size={16} strokeWidth={3} /> : exIdx + 1}</span>
                              <span className="wk-title">
                                <span className="wk-name">{ex.exercise_name}</span>
                                <span className="wk-summary">
                                  {summarizeExercise(sets).map((c, i) => (
                                    <span key={i} className={`wk-chip${c.kg ? ' kg' : ''}`}>{c.text}</span>
                                  ))}
                                </span>
                              </span>
                              <span className="wk-progress"><strong>{doneCount}/{sets.length}</strong>series</span>
                              <ChevronDown className="wk-chevron" size={18} strokeWidth={2} />
                            </button>
                            <div className="wk-bar"><span style={{ width: sets.length ? `${(doneCount / sets.length) * 100}%` : '0%' }} /></div>

                            {isExpanded && (
                              <div className="wk-body">
                                <div className="wk-body-actions">
                                  <button className="wk-info-btn" onClick={() => setInfoModal(ex)}><CirclePlay size={15} strokeWidth={2} /> Ver técnica</button>
                                </div>

                                {sets.map((set: any, sIdx: number) => {
                                  const done = !!completedSets[set.id];
                                  const prescribed = toNumber(set.weight);
                                  const current = getSetWeight(set);
                                  const typeClass = set.type === 'Top' ? 'top' : set.type === 'Back' ? 'back' : '';

                                  return (
                                    <div key={set.id} className={`wk-set${done ? ' is-done' : ''}`}>
                                      <div className="wk-set-idx">
                                        <span>Serie</span>
                                        <strong>{sIdx + 1}</strong>
                                        {typeClass && <span className={`wk-type ${typeClass}`}>{set.type}</span>}
                                      </div>

                                      <div className="wk-target">
                                        <span className="wk-label">Objetivo</span>
                                        <div className="wk-target-main">
                                          {set.reps || '—'} <small>reps</small>
                                          {toNumber(set.rpe) > 0 && <> · <small>RPE</small> {set.rpe}</>}
                                        </div>
                                        <div className="wk-target-sub">
                                          {prescribed > 0 ? `Peso sugerido: ${formatKg(prescribed)} kg` : 'Peso libre: elegí uno que te cueste'}
                                        </div>
                                      </div>

                                      <div className="wk-inputs">
                                        <div className="wk-field">
                                          <span className="wk-label">Peso usado (kg)</span>
                                          <div className="wk-stepper">
                                            <button type="button" aria-label="Restar 2.5 kg" onClick={() => updateSetWeight(set.id, current - 2.5)}>−</button>
                                            <input
                                              type="number"
                                              inputMode="decimal"
                                              step="0.5"
                                              min="0"
                                              placeholder="0"
                                              value={setWeights[set.id] ?? (prescribed > 0 ? prescribed : '')}
                                              onChange={(e) => updateSetWeight(set.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                                              aria-label={`Peso usado en la serie ${sIdx + 1}`}
                                            />
                                            <button type="button" aria-label="Sumar 2.5 kg" onClick={() => updateSetWeight(set.id, current + 2.5)}>+</button>
                                          </div>
                                        </div>
                                        <div className="wk-field">
                                          <span className="wk-label">Tu RPE</span>
                                          <input
                                            className="wk-rpe"
                                            type="number"
                                            inputMode="decimal"
                                            min="1"
                                            max="10"
                                            step="0.5"
                                            placeholder="—"
                                            value={setRpes[set.id] ?? ''}
                                            onChange={(e) => updateSetRpe(set.id, e.target.value)}
                                            aria-label={`RPE percibido en la serie ${sIdx + 1}`}
                                          />
                                        </div>
                                      </div>

                                      <button
                                        className={`wk-check${done ? ' is-done' : ''}`}
                                        onClick={() => handleCheckSet(ex, set, !done)}
                                        aria-pressed={done}
                                        aria-label={done ? `Desmarcar serie ${sIdx + 1}` : `Completar serie ${sIdx + 1}`}
                                        title={done ? 'Serie completada' : 'Marcar como completada'}
                                      >
                                        <Check size={22} strokeWidth={3} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {isDayCompleted(day) && (() => {
                      const stats = getDayStats(day);
                      return (
                        <motion.div className="wk-finish" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                          <h3 style={{ color: 'var(--neon-green)', margin: '0 0 1rem 0', textAlign: 'center' }}>¡Buen trabajo! 💪</h3>
                          <div className="wk-stats">
                            <div><strong>{stats.done}/{stats.total}</strong><span>Series</span></div>
                            <div><strong>{stats.volume.toLocaleString('es-AR')}</strong><span>kg volumen</span></div>
                            <div><strong>{Math.round((stats.done / Math.max(stats.total, 1)) * 100)}%</strong><span>Completado</span></div>
                          </div>
                          <p style={{ color: 'var(--foreground-muted)', margin: '0 0 1rem 0', fontSize: '0.75rem', textAlign: 'center' }}>
                            Volumen = peso × repeticiones de las series completadas.
                          </p>
                          <button
                            className="btn-primary"
                            disabled={savingWorkout}
                            style={{ backgroundColor: 'var(--neon-green)', color: '#000', fontWeight: '900', padding: '1rem 2rem', border: 'none', width: '100%', textTransform: 'uppercase', fontSize: '1.05rem' }}
                            onClick={() => handleFinishWorkout(day)}
                          >
                            {savingWorkout ? 'Guardando...' : 'Terminar Entrenamiento'}
                          </button>
                        </motion.div>
                      );
                    })()}
                  </>
                )}
              </div>
            </section>
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
              {infoModal.media && infoModal.media.length > 0 && infoModal.media.some((m: any) => m.url) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {infoModal.media.filter((m: any) => m.url).map((mediaItem: any, index: number) => {
                    const url = mediaItem.url;
                    const isVideo = url.match(/\.(mp4|webm|mov|ogg)$/i) || (url.includes("cloudinary") || url.includes("r2.dev")) && !url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

                    return (
                      <div key={index} style={{ borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#000', display: 'flex', justifyContent: 'center' }}>
                        {(() => {
                          if (isYouTube) {
                            return (
                              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, width: '100%' }}>
                                <iframe src={getEmbedUrl(url)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen title={`${infoModal.exercise_name} - ${index + 1}`}></iframe>
                              </div>
                            );
                          } else if (isImage) {
                            return <img src={url} alt={`${infoModal.exercise_name} - ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />;
                          } else if (isVideo || url.includes("cloudinary") || url.includes("r2.dev")) {
                            return <video src={url} controls playsInline preload="metadata" style={{ maxWidth: '100%', maxHeight: '400px', width: '100%' }}></video>;
                          } else {
                            return <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-blue)', padding: '2rem', display: 'block' }}>Abrir enlace multimedia {index + 1}</a>;
                          }
                        })()}
                      </div>
                    );
                  })}
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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

      <div className="profile-grid">
        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--neon-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Datos Físicos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Edad:</span> <strong>{anamnesis.age ? `${anamnesis.age} años` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Peso:</span> <strong>{anamnesis.current_weight ? `${anamnesis.current_weight} kg` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Altura:</span> <strong>{anamnesis.height ? `${anamnesis.height} cm` : '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Nutricionista:</span> <strong>{anamnesis.sees_nutritionist ? 'Sí' : 'No'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-muted)' }}>Horas de sueño:</span> <strong>{anamnesis.sleep_hours ? `${anamnesis.sleep_hours} hs` : '-'}</strong></div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--foreground-muted)' }}>Metas específicas:</span>
              <span style={{ backgroundColor: 'var(--surface)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{anamnesis.specific_goals || '-'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '1rem', borderBottom: '1px solid var(--surface-hover)', paddingBottom: '0.5rem' }}>Historial y Observaciones</h3>
          <div className="profile-grid">
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
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Trabajo u oficio:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem' }}>{anamnesis.occupation || 'Sin datos'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Enfermedades de base:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem', color: anamnesis.medical_conditions ? '#ff4d4d' : 'inherit' }}>{anamnesis.medical_conditions || 'Ninguna'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }}>Seguimiento con la alimentación:</span>
              <p style={{ fontSize: '0.875rem', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem' }}>{anamnesis.nutrition_tracking || '-'}</p>
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
