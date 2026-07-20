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

    const { studentId } = await request.json();

    // Set all previous anamnesis to inactive
    await query('UPDATE anamnesis SET is_active = false WHERE user_id = $1', [studentId]);

    return NextResponse.json({ message: 'Formulario reseteado exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
