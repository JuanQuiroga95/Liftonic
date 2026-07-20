import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    const body = await request.json();
    const { student_id, title, start_date, end_date, weeks } = body; 

    // 1. Crear Rutina
    const routineRes = await query(
      'INSERT INTO routines (student_id, professor_id, title, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [student_id, professorId, title, start_date, end_date]
    );
    const routineId = routineRes.rows[0].id;

    // 2. Crear Semanas, Días y Ejercicios
    for (const week of weeks) {
      const weekRes = await query(
        'INSERT INTO routine_weeks (routine_id, week_number) VALUES ($1, $2) RETURNING id',
        [routineId, week.week_number]
      );
      const weekId = weekRes.rows[0].id;

      for (const day of week.days) {
        const dayRes = await query(
          'INSERT INTO routine_days (week_id, day_name) VALUES ($1, $2) RETURNING id',
          [weekId, day.day_name]
        );
        const dayId = dayRes.rows[0].id;

        let orderIndex = 0;
        for (const ex of day.exercises) {
          await query(
            'INSERT INTO daily_exercises (day_id, exercise_id, order_index, sets) VALUES ($1, $2, $3, $4)',
            [dayId, ex.exercise_id, orderIndex, JSON.stringify(ex.sets || [])]
          );
          orderIndex++;
        }
      }
    }

    return NextResponse.json({ message: 'Rutina creada exitosamente', id: routineId }, { status: 201 });
  } catch (error) {
    console.error('Error saving routine:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
