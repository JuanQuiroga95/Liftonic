import webpush from 'web-push';
import { createHmac, timingSafeEqual } from 'crypto';
import { query } from '@/lib/db';

let configured = false;

export function pushConfigured() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'https://liftonic-blush.vercel.app', publicKey, privateKey);
  configured = true;
  return true;
}

type PushPayload = { title: string; body: string; kind: 'warn' | 'end'; tag?: string; url?: string };

export async function sendPushToUser(userId: string, payload: PushPayload, ttlSeconds: number) {
  if (!pushConfigured()) return;
  const subs = await query('SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1', [userId]);

  await Promise.all(subs.rows.map(async (s: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ tag: 'rest-timer', ...payload }),
        { TTL: ttlSeconds, urgency: 'high' }
      );
    } catch (err: any) {
      // 404/410: la suscripción ya no existe (app desinstalada, permiso revocado)
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [s.endpoint]);
      } else {
        console.error('Push error:', err?.statusCode, err?.body || err?.message);
      }
    }
  }));
}

// --- Temporizador de descanso -------------------------------------------------
// Una función serverless no puede quedar esperando para siempre, así que cada
// invocación espera como máximo RUN_BUDGET_MS y, si falta más, se encadena
// llamando a /api/alumno/rest-timer/continue.

const WARN_BEFORE_MS = 10_000;
const RUN_BUDGET_MS = 240_000;

const sleep = (ms: number) => new Promise(r => setTimeout(r, Math.max(0, ms)));

export function signTimer(userId: string, timerId: string) {
  return createHmac('sha256', process.env.VAPID_PRIVATE_KEY || '').update(`${userId}:${timerId}`).digest('hex');
}

export function verifyTimerSig(userId: string, timerId: string, sig: string) {
  const expected = Buffer.from(signTimer(userId, timerId));
  const given = Buffer.from(String(sig || ''));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function getActiveTimer(userId: string, timerId: string) {
  const res = await query('SELECT ends_at, label FROM rest_timers WHERE user_id = $1 AND timer_id = $2', [userId, timerId]);
  if (res.rows.length === 0) return null;
  return { endsAt: new Date(res.rows[0].ends_at).getTime(), label: res.rows[0].label as string | null };
}

export async function runRestTimer(userId: string, timerId: string, origin: string) {
  const startedAt = Date.now();

  while (true) {
    const timer = await getActiveTimer(userId, timerId);
    if (!timer) return; // cancelado o reemplazado por otro temporizador

    const now = Date.now();
    const warnAt = timer.endsAt - WARN_BEFORE_MS;

    if (now >= timer.endsAt - 500) {
      await query('DELETE FROM rest_timers WHERE user_id = $1 AND timer_id = $2', [userId, timerId]);
      await sendPushToUser(userId, {
        kind: 'end',
        title: '¡Descanso terminado! 💪',
        body: timer.label || 'A darle, arrancá la próxima serie.',
      }, 120);
      return;
    }

    const isWarn = now < warnAt - 1000;
    const target = isWarn ? warnAt : timer.endsAt;

    if (target - startedAt > RUN_BUDGET_MS) {
      await fetch(`${origin}/api/alumno/rest-timer/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timerId, sig: signTimer(userId, timerId) }),
      }).catch(err => console.error('Rest timer chain error:', err));
      return;
    }

    await sleep(target - Date.now());

    if (isWarn && await getActiveTimer(userId, timerId)) {
      await sendPushToUser(userId, {
        kind: 'warn',
        title: '⏱️ Te quedan 10 segundos',
        body: 'Preparate para la próxima serie.',
      }, 15);
    }
  }
}
