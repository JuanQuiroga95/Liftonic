import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Faltan datos de archivo' }, { status: 400 });
    }

    // Usar la carpeta liftonic_exercises y agregar un timestamp para evitar colisiones
    const uniqueFilename = `liftonic_exercises/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // La URL firmada expira en 5 minutos
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;

    return NextResponse.json({ 
      signedUrl, 
      publicUrl, 
      filename: uniqueFilename 
    });
  } catch (error) {
    console.error('Error signing R2 upload:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
