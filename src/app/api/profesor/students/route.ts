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
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '').trim();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const existingUser = await query('SELECT id FROM users WHERE LOWER(TRIM(username)) = LOWER($1)', [username]);
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

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const professorId = (session.user as any).id;
    const body = await request.json();
    const id = body.id;
    const name = String(body.name ?? '').trim();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '').trim();

    if (!id) return NextResponse.json({ error: 'Falta el ID del alumno' }, { status: 400 });
    if (!name || !username) return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });

    // Check if new username is taken by someone else
    const existing = await query('SELECT id FROM users WHERE LOWER(TRIM(username)) = LOWER($1) AND id != $2', [username, id]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'El nombre de usuario ya está en uso por otra persona' }, { status: 409 });
    }

    if (password !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET name = $1, username = $2, password_hash = $3 WHERE id = $4 AND professor_id = $5 AND role = $6',
        [name, username, passwordHash, id, professorId, 'ALUMNO']
      );
    } else {
      await query(
        'UPDATE users SET name = $1, username = $2 WHERE id = $3 AND professor_id = $4 AND role = $5',
        [name, username, id, professorId, 'ALUMNO']
      );
    }

    return NextResponse.json({ message: 'Alumno actualizado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
