// api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  scope: "https://www.googleapis.com/auth/drive",
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No valid file uploaded' },
        { status: 400 }
      );
    }
    
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!]
      },
      media: {
        mimeType: file.type,
        body: Readable.from(Buffer.from(await file.arrayBuffer())),
      },
    });

    // Set public permissions
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const imageUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(imageBuffer));

    const publicImageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ success: true, imageUrl: publicImageUrl });
  } catch (error) {
    console.error("Full error details:", error);
    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: 500 }
    );
  }
}