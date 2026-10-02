import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { toRest } from '@/lib/rest';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: dailyExerciseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { sets, rest_seconds, rest_after_seconds } = body;

    if (!sets || !Array.isArray(sets)) {
      return NextResponse.json({ error: 'Formato de series inválido' }, { status: 400 });
    }

    // Actualizar el array de sets en el ejercicio diario (y los descansos si vienen)
    if ('rest_seconds' in body || 'rest_after_seconds' in body) {
      await query(
        'UPDATE daily_exercises SET sets = $1, rest_seconds = $2, rest_after_seconds = $3 WHERE id = $4',
        [JSON.stringify(sets), toRest(rest_seconds), toRest(rest_after_seconds), dailyExerciseId]
      );
    } else {
      await query(
        'UPDATE daily_exercises SET sets = $1 WHERE id = $2',
        [JSON.stringify(sets), dailyExerciseId]
      );
    }

    return NextResponse.json({ message: 'Series actualizadas exitosamente' });
  } catch (error) {
    console.error('Error updating sets:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
