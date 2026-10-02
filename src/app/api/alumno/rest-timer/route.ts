import { NextResponse, after } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { pushConfigured, runRestTimer } from '@/lib/push';

// La función queda esperando hasta mandar el push; si el descanso es más largo se encadena.
export const maxDuration = 300;

const MAX_REST_MS = 15 * 60 * 1000;

// La app lo llama cuando el alumno sale de la app con un descanso en curso
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (!pushConfigured()) {
      return NextResponse.json({ error: 'Notificaciones no configuradas' }, { status: 503 });
    }

    const userId = (session.user as any).id;
    const { endsAt, label } = await request.json();
    const endsAtMs = Number(endsAt);
    const now = Date.now();

    if (!Number.isFinite(endsAtMs) || endsAtMs <= now || endsAtMs > now + MAX_REST_MS) {
      return NextResponse.json({ error: 'Horario inválido' }, { status: 400 });
    }

    // Un solo temporizador activo por alumno: el nuevo reemplaza al anterior
    const timerId = uuidv4();
    await query(`
      INSERT INTO rest_timers (user_id, timer_id, ends_at, label)
      VALUES ($1, $2, to_timestamp($3 / 1000.0), $4)
      ON CONFLICT (user_id) DO UPDATE SET timer_id = $2, ends_at = to_timestamp($3 / 1000.0), label = $4
    `, [userId, timerId, endsAtMs, typeof label === 'string' ? label.slice(0, 200) : null]);

    const origin = new URL(request.url).origin;
    after(() => runRestTimer(userId, timerId, origin));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error scheduling rest timer:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// La app lo llama al volver a primer plano o al saltear / terminar el descanso
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await query('DELETE FROM rest_timers WHERE user_id = $1', [(session.user as any).id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error cancelling rest timer:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
