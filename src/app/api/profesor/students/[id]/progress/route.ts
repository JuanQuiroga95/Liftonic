import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const studentId = params?.id || context.params.id;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;

    // Verificar que el alumno pertenece a este profesor
    const checkRes = await query('SELECT id FROM users WHERE id = $1 AND professor_id = $2', [studentId, professorId]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Alumno no encontrado o no autorizado' }, { status: 403 });
    }

    const completedDaysQuery = `
      SELECT DISTINCT rd.id, r.start_date, rw.week_number
      FROM daily_exercises de
      JOIN routine_days rd ON de.day_id = rd.id
      JOIN routine_weeks rw ON rd.week_id = rw.id
      JOIN routines r ON rw.routine_id = r.id
      WHERE r.student_id = $1 AND de.actual_weight IS NOT NULL
    `;
    
    const totalDaysQuery = `
      SELECT COUNT(rd.id) as total
      FROM routine_days rd
      JOIN routine_weeks rw ON rd.week_id = rw.id
      JOIN routines r ON rw.routine_id = r.id
      WHERE r.student_id = $1
    `;

    const [completedRes, totalRes] = await Promise.all([
      query(completedDaysQuery, [studentId]),
      query(totalDaysQuery, [studentId])
    ]);

    const trainedDays = completedRes.rows.length;
    const totalDays = parseInt(totalRes.rows[0].total) || 0;
    
    const compliance = totalDays > 0 ? Math.round((trainedDays / totalDays) * 100) : 0;
    const streak = Math.max(0, Math.floor(trainedDays / 3));

    const attendanceDates = completedRes.rows.map(row => {
      const date = new Date(row.start_date);
      date.setDate(date.getDate() + (row.week_number - 1) * 7);
      return date.toISOString().split('T')[0];
    });

    const plannedQuery = `
      SELECT date
      FROM planned_attendance
      WHERE student_id = $1
    `;

    // Intentamos obtener las planeadas
    let plannedDates: string[] = [];
    try {
      const plannedRes = await query(plannedQuery, [studentId]);
      plannedDates = plannedRes.rows.map(r => new Date(r.date).toISOString().split('T')[0]);
    } catch(e) {}

    return NextResponse.json({ trainedDays, streak, compliance, attendanceDates, plannedDates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
