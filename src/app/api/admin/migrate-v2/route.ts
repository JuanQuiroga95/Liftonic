import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Actualización de Historial de Anamnesis
    await query(`
      ALTER TABLE anamnesis DROP CONSTRAINT IF EXISTS anamnesis_user_id_key;
      ALTER TABLE anamnesis ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);

    // 2. Soporte Multimedia Dual para Ejercicios
    // Create ENUM type if it doesn't exist
    await query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
              CREATE TYPE media_type AS ENUM ('LINK', 'UPLOAD');
          END IF;
      END$$;
    `);

    // Create exercise_media table
    await query(`
      CREATE TABLE IF NOT EXISTS exercise_media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
          type media_type NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({ message: 'Migración V2 completada exitosamente. Las rutinas ahora cargarán sin problemas.' });
  } catch (error: any) {
    console.error('Migration v2 error:', error);
    return NextResponse.json({ error: 'Error ejecutando migración V2', details: error.message }, { status: 500 });
  }
}
