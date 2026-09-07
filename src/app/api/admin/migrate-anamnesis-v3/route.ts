import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Nuevos campos de la encuesta: ocupacion, enfermedades de base,
    // metas especificas, seguimiento nutricional y horas de sueno.
    await query(`
      ALTER TABLE anamnesis
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
      ADD COLUMN IF NOT EXISTS specific_goals TEXT,
      ADD COLUMN IF NOT EXISTS nutrition_tracking TEXT,
      ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(3,1);
    `);

    return NextResponse.json({ message: 'Migracion de anamnesis V3 completada: trabajo, enfermedades de base, metas especificas, seguimiento nutricional y horas de sueno.' });
  } catch (error: any) {
    console.error('Migration anamnesis v3 error:', error);
    return NextResponse.json({ error: 'Error ejecutando migracion de anamnesis V3', details: error.message }, { status: 500 });
  }
}
