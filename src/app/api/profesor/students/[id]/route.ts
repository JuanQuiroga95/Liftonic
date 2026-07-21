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
    
    const result = await query(
      'SELECT id, username, name, created_at, profile_picture_url FROM users WHERE id = $1 AND professor_id = $2 AND role = $3', 
      [studentId, professorId, 'ALUMNO']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
