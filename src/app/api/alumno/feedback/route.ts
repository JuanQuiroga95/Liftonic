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

    const { exerciseId, actualWeight, actualReps, studentRpe } = await request.json();

    // Actualizamos el daily_exercise con el feedback del alumno
    await query(`
      UPDATE daily_exercises 
      SET actual_weight = $1, actual_reps = $2, student_rpe = $3
      WHERE id = $4
    `, [actualWeight, actualReps, studentRpe, exerciseId]);

    return NextResponse.json({ message: 'Feedback guardado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
