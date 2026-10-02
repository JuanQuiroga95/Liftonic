import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// Guarda la suscripción push del dispositivo del alumno (para avisarle del descanso con la app cerrada)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const { subscription } = await request.json();
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;

    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || !p256dh || !auth) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 });
    }

    await query(`
      INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (endpoint) DO UPDATE SET user_id = $2, p256dh = $3, auth = $4
    `, [endpoint, userId, p256dh, auth]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
