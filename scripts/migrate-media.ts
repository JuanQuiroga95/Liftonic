import { Pool } from 'pg';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function downloadFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

async function uploadToR2(buffer: Buffer, contentType: string, originalUrl: string) {
  // Extraer extensión original
  const ext = originalUrl.split('.').pop()?.split('?')[0] || 'bin';
  const uniqueFilename = `migrated/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: uniqueFilename,
    Body: buffer,
    ContentType: contentType,
  });

  await S3.send(command);
  return `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;
}

async function migrate() {
  console.log("Iniciando migración...");

  // 1. Migrar exercise_media
  const exerciseMediaRes = await pool.query("SELECT id, url FROM exercise_media WHERE url LIKE '%cloudinary%'");
  console.log(`Encontrados ${exerciseMediaRes.rowCount} archivos de ejercicios en Cloudinary`);

  for (const row of exerciseMediaRes.rows) {
    try {
      console.log(`Migrando: ${row.url}`);
      const { buffer, contentType } = await downloadFile(row.url);
      const newUrl = await uploadToR2(buffer, contentType, row.url);
      await pool.query("UPDATE exercise_media SET url = $1 WHERE id = $2", [newUrl, row.id]);
      console.log(`✅ Actualizado a: ${newUrl}`);
    } catch (err) {
      console.error(`❌ Error migrando ejercicio ID ${row.id}:`, err);
    }
  }

  // 2. Migrar profile pictures
  const usersRes = await pool.query("SELECT id, profile_picture_url FROM users WHERE profile_picture_url LIKE '%cloudinary%'");
  console.log(`Encontrados ${usersRes.rowCount} usuarios con fotos en Cloudinary`);

  for (const row of usersRes.rows) {
    try {
      console.log(`Migrando foto de usuario ${row.id}: ${row.profile_picture_url}`);
      const { buffer, contentType } = await downloadFile(row.profile_picture_url);
      const newUrl = await uploadToR2(buffer, contentType, row.profile_picture_url);
      await pool.query("UPDATE users SET profile_picture_url = $1 WHERE id = $2", [newUrl, row.id]);
      console.log(`✅ Actualizado a: ${newUrl}`);
    } catch (err) {
      console.error(`❌ Error migrando usuario ID ${row.id}:`, err);
    }
  }

  console.log("🎉 Migración completada exitosamente.");
  process.exit(0);
}

migrate();
