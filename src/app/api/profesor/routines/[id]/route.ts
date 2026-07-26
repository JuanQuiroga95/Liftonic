import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routineId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;

    // Verificar si la rutina pertenece a este profesor
    const checkRes = await query('SELECT id FROM routines WHERE id = $1 AND professor_id = $2', [routineId, professorId]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Rutina no encontrada o no autorizada' }, { status: 404 });
    }

    // Eliminar la rutina (ON DELETE CASCADE limpiará las tablas hijas)
    await query('DELETE FROM routines WHERE id = $1 AND professor_id = $2', [routineId, professorId]);

    return NextResponse.json({ message: 'Rutina eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routineId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;

    // Verificar si la rutina pertenece a este profesor
    const checkRes = await query('SELECT id FROM routines WHERE id = $1 AND professor_id = $2', [routineId, professorId]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Rutina no encontrada o no autorizada' }, { status: 404 });
    }

    const body = await request.json();
    const { title, start_date, end_date, weeks } = body; 

    // Usaremos transacciones para evitar inconsistencias
    await query('BEGIN');

    // Actualizar datos de la rutina
    await query(
      'UPDATE routines SET title = $1, start_date = $2, end_date = $3 WHERE id = $4',
      [title, start_date, end_date, routineId]
    );

    // Obtener las semanas existentes
    const existingWeeksRes = await query('SELECT id FROM routine_weeks WHERE routine_id = $1', [routineId]);
    const existingWeekIds = existingWeeksRes.rows.map((r: any) => r.id);

    // Trackear los IDs procesados para no borrarlos
    const processedWeekIds = new Set<string>();
    const processedDayIds = new Set<string>();
    const processedExerciseIds = new Set<string>();

    for (const week of weeks) {
      let weekId = week.id;
      // Si el id no es un UUID válido de postgres o no existe, lo creamos
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(weekId);
      
      let weekExists = false;
      if (isUUID && existingWeekIds.includes(weekId)) {
        weekExists = true;
      }

      if (!weekExists) {
        const weekRes = await query(
          'INSERT INTO routine_weeks (routine_id, week_number) VALUES ($1, $2) RETURNING id',
          [routineId, week.week_number]
        );
        weekId = weekRes.rows[0].id;
      } else {
        await query(
          'UPDATE routine_weeks SET week_number = $1 WHERE id = $2',
          [week.week_number, weekId]
        );
      }
      processedWeekIds.add(weekId);

      // Days
      const existingDaysRes = await query('SELECT id FROM routine_days WHERE week_id = $1', [weekId]);
      const existingDayIds = existingDaysRes.rows.map((r: any) => r.id);

      for (const day of week.days) {
        let dayId = day.id;
        const isDayUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dayId);
        
        let dayExists = false;
        if (isDayUUID && existingDayIds.includes(dayId)) {
          dayExists = true;
        }

        if (!dayExists) {
          const dayRes = await query(
            'INSERT INTO routine_days (week_id, day_name) VALUES ($1, $2) RETURNING id',
            [weekId, day.day_name]
          );
          dayId = dayRes.rows[0].id;
        } else {
          await query(
            'UPDATE routine_days SET day_name = $1 WHERE id = $2',
            [day.day_name, dayId]
          );
        }
        processedDayIds.add(dayId);

        // Exercises
        const existingExRes = await query('SELECT id FROM daily_exercises WHERE day_id = $1', [dayId]);
        const existingExIds = existingExRes.rows.map((r: any) => r.id);

        let orderIndex = 0;
        for (const ex of day.exercises) {
          let exId = ex.id;
          const isExUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exId);
          
          let exExists = false;
          if (isExUUID && existingExIds.includes(exId)) {
            exExists = true;
          }

          if (!exExists) {
            const exRes = await query(
              'INSERT INTO daily_exercises (day_id, exercise_id, order_index, sets) VALUES ($1, $2, $3, $4) RETURNING id',
              [dayId, ex.exercise_id, orderIndex, JSON.stringify(ex.sets || [])]
            );
            exId = exRes.rows[0].id;
          } else {
            // Update sets and order
            await query(
              'UPDATE daily_exercises SET exercise_id = $1, order_index = $2, sets = $3 WHERE id = $4',
              [ex.exercise_id, orderIndex, JSON.stringify(ex.sets || []), exId]
            );
          }
          processedExerciseIds.add(exId);
          orderIndex++;
        }
        
        // Delete removed exercises for this day
        const exercisesToDelete = existingExIds.filter((id: string) => !processedExerciseIds.has(id));
        if (exercisesToDelete.length > 0) {
          await query(`DELETE FROM daily_exercises WHERE id = ANY($1::uuid[])`, [exercisesToDelete]);
        }
      }
      
      // Delete removed days for this week
      const daysToDelete = existingDayIds.filter((id: string) => !processedDayIds.has(id));
      if (daysToDelete.length > 0) {
        await query(`DELETE FROM routine_days WHERE id = ANY($1::uuid[])`, [daysToDelete]);
      }
    }
    
    // Delete removed weeks for this routine
    const weeksToDelete = existingWeekIds.filter((id: string) => !processedWeekIds.has(id));
    if (weeksToDelete.length > 0) {
      await query(`DELETE FROM routine_weeks WHERE id = ANY($1::uuid[])`, [weeksToDelete]);
    }

    await query('COMMIT');

    return NextResponse.json({ message: 'Rutina actualizada exitosamente' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
