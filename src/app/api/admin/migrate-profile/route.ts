import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
    `);

    return NextResponse.json({ message: 'Columna profile_picture_url añadida a users exitosamente' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Error ejecutando migración' }, { status: 500 });
  }
}
