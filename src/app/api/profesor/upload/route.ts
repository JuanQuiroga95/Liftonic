import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
      return NextResponse.json({ error: 'Filename and body required' }, { status: 400 });
    }

    // Convert raw binary body to base64 for Cloudinary upload
    const buffer = await request.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    
    // Guess mime type simply by extension or default to video if it's large, but let Cloudinary auto-detect
    const fileUri = `data:auto/auto;base64,${base64Data}`;

    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      resource_type: 'auto', // Automatically detect if it's an image or video
      folder: 'liftonic_exercises',
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
