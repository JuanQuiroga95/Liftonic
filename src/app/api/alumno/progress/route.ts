import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;

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
      query(completedDaysQuery, [userId]),
      query(totalDaysQuery, [userId])
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

    let plannedDates: string[] = [];
    try {
      const plannedRes = await query(plannedQuery, [userId]);
      plannedDates = plannedRes.rows.map(r => new Date(r.date).toISOString().split('T')[0]);
    } catch(e) {
    }

    return NextResponse.json({
      trainedDays,
      streak,
      compliance,
      attendanceDates,
      plannedDates
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
