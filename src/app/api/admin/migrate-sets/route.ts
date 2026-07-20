import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // We add the new column `sets` (JSONB)
    // We can also drop the old ones or just leave them. Dropping might throw errors if views depend on it, but we have no views.
    await query(`
      ALTER TABLE daily_exercises 
      ADD COLUMN IF NOT EXISTS sets JSONB DEFAULT '[]'::jsonb;
    `);

    // Only drop if they exist, but postgres doesn't support IF EXISTS easily for multiple drops.
    try {
      await query(`
        ALTER TABLE daily_exercises 
        DROP COLUMN IF EXISTS target_sets,
        DROP COLUMN IF EXISTS target_reps,
        DROP COLUMN IF EXISTS target_weight;
      `);
    } catch (e) {
      console.log("Columns already dropped or error dropping:", e);
    }
    
    return NextResponse.json({ message: 'Migración a sistema avanzado de series completada' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Error ejecutando migración' }, { status: 500 });
  }
}
