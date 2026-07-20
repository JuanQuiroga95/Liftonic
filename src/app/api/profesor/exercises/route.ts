import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { name, media } = await request.json(); // media is array of { type: 'LINK' | 'UPLOAD', url: string }

    const exerciseRes = await query(
      'INSERT INTO exercises (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [name]
    );
    const exerciseId = exerciseRes.rows[0].id;

    if (media && media.length > 0) {
      for (const item of media) {
        await query(
          'INSERT INTO exercise_media (exercise_id, type, url) VALUES ($1, $2, $3)',
          [exerciseId, item.type, item.url]
        );
      }
    }

    return NextResponse.json({ message: 'Ejercicio guardado', id: exerciseId }, { status: 201 });
  } catch (error) {
    console.error('Error in exercises:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await query(`
      SELECT e.id, e.name, 
        json_agg(json_build_object('id', em.id, 'type', em.type, 'url', em.url)) as media
      FROM exercises e
      LEFT JOIN exercise_media em ON e.id = em.exercise_id
      GROUP BY e.id, e.name
      ORDER BY e.name ASC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
