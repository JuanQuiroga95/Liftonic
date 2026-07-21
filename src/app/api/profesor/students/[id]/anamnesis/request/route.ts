import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Al poner is_active en false, el alumno tendrá que rellenar el formulario
    // la próxima vez que entre a la aplicación (ya que la ruta /api/alumno/anamnesis solo busca is_active = true)
    await query('UPDATE anamnesis SET is_active = false WHERE user_id = $1', [studentId]);
    
    return NextResponse.json({ message: 'Se ha solicitado una nueva encuesta al alumno' });
  } catch (error) {
    console.error('Error requesting new anamnesis:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
