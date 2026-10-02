import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Descansos entre series / entre ejercicios y notificaciones push del temporizador.
    await query(`
      ALTER TABLE daily_exercises
      ADD COLUMN IF NOT EXISTS rest_seconds INTEGER,
      ADD COLUMN IF NOT EXISTS rest_after_seconds INTEGER;

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        endpoint TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_id);

      CREATE TABLE IF NOT EXISTS rest_timers (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        timer_id UUID NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        label TEXT
      );
    `);

    return NextResponse.json({ message: 'Migracion de descansos completada: tiempos de descanso por ejercicio y notificaciones push.' });
  } catch (error: any) {
    console.error('Migration rest timers error:', error);
    return NextResponse.json({ error: 'Error ejecutando migracion de descansos', details: error.message }, { status: 500 });
  }
}
