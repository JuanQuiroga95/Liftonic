import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Check if there's already an active one. Normally the UI wouldn't allow this, but let's be safe.
    await query('UPDATE anamnesis SET is_active = false WHERE user_id = $1', [userId]);

    const q = `
      INSERT INTO anamnesis (
        user_id, training_experience, other_activities, injuries_conditions, 
        weekly_frequency, muscle_interests, exercise_preferences, training_goal, 
        sees_nutritionist, current_weight, height, age, split_preference, additional_comments, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
    `;
    const values = [
      userId, body.training_experience, body.other_activities, body.injuries_conditions,
      body.weekly_frequency, body.muscle_interests, body.exercise_preferences, body.training_goal,
      body.sees_nutritionist, body.current_weight, body.height, body.age, body.split_preference, body.additional_comments
    ];

    await query(q, values);

    return NextResponse.json({ message: 'Anamnesis guardada' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ALUMNO') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const result = await query('SELECT * FROM anamnesis WHERE user_id = $1 AND is_active = true', [userId]);
    
    return NextResponse.json(result.rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
