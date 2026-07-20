import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query(`
      ALTER TABLE exercises 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS variation VARCHAR(255);
    `);
    
    return NextResponse.json({ message: 'Migración completada exitosamente' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Error ejecutando migración' }, { status: 500 });
  }
}
