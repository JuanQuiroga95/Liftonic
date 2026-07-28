import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: studentId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    
    // Get all routines for this student by this professor
    const routineRes = await query(`
      SELECT id, title, start_date, end_date, created_at 
      FROM routines 
      WHERE student_id = $1 AND professor_id = $2
      ORDER BY created_at DESC
    `, [studentId, professorId]);

    if (routineRes.rows.length === 0) {
      return NextResponse.json([]);
    }

    const routines = [];

    for (const routine of routineRes.rows) {
      // Build the full routine object with weeks, days, and exercises
      const weeksRes = await query('SELECT * FROM routine_weeks WHERE routine_id = $1 ORDER BY week_number ASC', [routine.id]);
      
      const weeks = [];
      for (const week of weeksRes.rows) {
        const daysRes = await query('SELECT * FROM routine_days WHERE week_id = $1', [week.id]);
        const days = [];
        for (const day of daysRes.rows) {
          const exercisesRes = await query(`
            SELECT de.*, e.name as exercise_name,
              (SELECT json_agg(json_build_object('type', em.type, 'url', em.url)) 
               FROM exercise_media em WHERE em.exercise_id = e.id) as media
            FROM daily_exercises de
            JOIN exercises e ON de.exercise_id = e.id
            WHERE de.day_id = $1
            ORDER BY de.order_index ASC
          `, [day.id]);
          days.push({ ...day, exercises: exercisesRes.rows });
        }
        weeks.push({ ...week, days });
      }

      routines.push({ ...routine, weeks });
    }

    return NextResponse.json(routines);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
