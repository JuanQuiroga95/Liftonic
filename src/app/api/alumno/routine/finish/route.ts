import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { exercises } = body; 
    // exercises is an array of objects: { id: 'daily_exercise_id', weight: number }

    if (!exercises || !Array.isArray(exercises)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    for (const ex of exercises) {
      await query(
        'UPDATE daily_exercises SET actual_weight = $1 WHERE id = $2',
        [ex.weight, ex.id]
      );
    }

    return NextResponse.json({ message: 'Entrenamiento guardado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
