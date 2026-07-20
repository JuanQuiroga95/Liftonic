import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    const { name, username, password } = await request.json();

    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'El nombre de usuario ya está en uso' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, password_hash, name, role, professor_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [username, passwordHash, name, 'ALUMNO', professorId]
    );

    return NextResponse.json({ message: 'Alumno creado', id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    const result = await query('SELECT id, username, name, created_at FROM users WHERE role = $1 AND professor_id = $2', ['ALUMNO', professorId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    // Ensure the student belongs to this professor
    await query('DELETE FROM users WHERE id = $1 AND professor_id = $2 AND role = $3', [studentId, professorId, 'ALUMNO']);
    
    return NextResponse.json({ message: 'Alumno eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
