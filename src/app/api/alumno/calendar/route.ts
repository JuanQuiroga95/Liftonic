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

    const studentId = (session.user as any).id;
    const body = await request.json();
    const { date, action } = body; // action: 'add' o 'remove'

    if (!date) return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });

    // Asegurar que la tabla existe (se ejecuta una vez y luego ignora si existe)
    await query(`
      CREATE TABLE IF NOT EXISTS planned_attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        UNIQUE(student_id, date)
      );
    `);

    if (action === 'add') {
      await query(
        `INSERT INTO planned_attendance (student_id, date) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [studentId, date]
      );
    } else if (action === 'remove') {
      await query(
        `DELETE FROM planned_attendance WHERE student_id = $1 AND date = $2`,
        [studentId, date]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
