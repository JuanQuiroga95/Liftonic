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
