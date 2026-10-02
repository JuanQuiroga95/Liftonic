import { NextResponse, after } from 'next/server';
import { runRestTimer, verifyTimerSig } from '@/lib/push';

export const maxDuration = 300;

// Continuación interna de un descanso largo (la llama runRestTimer, firmada con HMAC)
export async function POST(request: Request) {
  try {
    const { userId, timerId, sig } = await request.json();
    if (typeof userId !== 'string' || typeof timerId !== 'string' || !verifyTimerSig(userId, timerId, sig)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const origin = new URL(request.url).origin;
    after(() => runRestTimer(userId, timerId, origin));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error continuing rest timer:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
