import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const studentId = params.id;
    const professorId = (session.user as any).id;

    // Verificar que el alumno pertenece a este profesor
    const checkRes = await query('SELECT id FROM users WHERE id = $1 AND professor_id = $2', [studentId, professorId]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Alumno no encontrado o no autorizado' }, { status: 403 });
    }

    const metricsQuery = `
      SELECT 
        e.id as exercise_id,
        e.name as exercise_name,
        de.actual_weight,
        de.actual_reps,
        r.start_date,
        rw.week_number
      FROM daily_exercises de
      JOIN exercises e ON de.exercise_id = e.id
      JOIN routine_days rd ON de.day_id = rd.id
      JOIN routine_weeks rw ON rd.week_id = rw.id
      JOIN routines r ON rw.routine_id = r.id
      WHERE r.student_id = $1 AND de.actual_weight IS NOT NULL
      ORDER BY r.start_date ASC, rw.week_number ASC
    `;
    const res = await query(metricsQuery, [studentId]);

    const historyByExercise: any = {};
    res.rows.forEach(row => {
      if (!historyByExercise[row.exercise_name]) {
        historyByExercise[row.exercise_name] = [];
      }
      
      const date = new Date(row.start_date);
      date.setDate(date.getDate() + (row.week_number - 1) * 7);
      
      historyByExercise[row.exercise_name].push({
        weight: parseFloat(row.actual_weight),
        reps: row.actual_reps,
        date: date.toISOString().split('T')[0]
      });
    });

    const prs: any[] = [];
    Object.keys(historyByExercise).forEach(exName => {
      const records = historyByExercise[exName];
      let maxWeight = 0;
      let maxDate = '';
      records.forEach((r: any) => {
        if (r.weight >= maxWeight) {
          maxWeight = r.weight;
          maxDate = r.date;
        }
      });
      prs.push({
        exercise: exName,
        pr: maxWeight,
        date: maxDate,
        history: records
      });
    });

    prs.sort((a, b) => b.pr - a.pr);

    return NextResponse.json(prs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
