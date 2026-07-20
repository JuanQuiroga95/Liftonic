import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const result = await query('SELECT name, username, profile_picture_url FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const { name, profile_picture_url } = await request.json();

    await query(
      'UPDATE users SET name = $1, profile_picture_url = $2 WHERE id = $3',
      [name, profile_picture_url, userId]
    );
    
    return NextResponse.json({ message: 'Perfil actualizado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
