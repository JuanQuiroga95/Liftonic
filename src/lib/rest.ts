// Tiempos de descanso de los ejercicios (en segundos)

// Opciones para los selectores. 0 = sin temporizador
export const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

export const formatRest = (sec?: number | null) => {
  if (!sec) return 'Sin descanso';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} seg`;
  return s ? `${m}:${String(s).padStart(2, '0')} min` : `${m} min`;
};

// Normaliza lo que llega del cliente para guardar en la base (null = sin temporizador)
export const toRest = (v: any) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 900) : null;
};
