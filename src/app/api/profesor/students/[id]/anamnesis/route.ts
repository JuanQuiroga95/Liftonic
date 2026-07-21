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

    // Verificar que el estudiante pertenece a este profesor
    const studentRes = await query('SELECT id FROM users WHERE id = $1 AND professor_id = $2', [studentId, professorId]);
    if (studentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Obtener todo el historial de anamnesis ordenado por el más reciente
    const result = await query('SELECT * FROM anamnesis WHERE user_id = $1 ORDER BY created_at DESC', [studentId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching anamnesis:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
