import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const { name, description, variation, media } = await request.json();

    // Actualizar datos básicos
    await query(
      'UPDATE exercises SET name = $1, description = $2, variation = $3 WHERE id = $4',
      [name, description || null, variation || null, id]
    );

    // Recrear medios
    await query('DELETE FROM exercise_media WHERE exercise_id = $1', [id]);
    
    if (media && media.length > 0) {
      for (const item of media) {
        await query(
          'INSERT INTO exercise_media (exercise_id, type, url) VALUES ($1, $2, $3)',
          [id, item.type, item.url]
        );
      }
    }

    return NextResponse.json({ message: 'Ejercicio actualizado' });
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un ejercicio con ese nombre' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    // Se intentará borrar. Si el ejercicio está asignado a un alumno, el ON DELETE RESTRICT fallará con código 23503.
    await query('DELETE FROM exercises WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Ejercicio eliminado' });
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    if (error.code === '23503') {
      return NextResponse.json({ error: 'No se puede borrar este ejercicio porque actualmente está siendo utilizado en la rutina de uno o más alumnos.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
