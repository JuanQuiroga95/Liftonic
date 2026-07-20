-- 1. Actualización de Historial de Anamnesis
-- Permitir que un usuario tenga múltiples formularios (quitando la restricción UNIQUE)
ALTER TABLE anamnesis DROP CONSTRAINT anamnesis_user_id_key;

-- Añadir bandera para saber cuál es el formulario activo
ALTER TABLE anamnesis ADD COLUMN is_active BOOLEAN DEFAULT true;


-- 2. Soporte Multimedia Dual para Ejercicios
-- Crear el tipo de media
CREATE TYPE media_type AS ENUM ('LINK', 'UPLOAD');

-- Crear la tabla que alojará los archivos y links
CREATE TABLE exercise_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
