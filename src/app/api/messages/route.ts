import { NextResponse } from "next/server";

let messages: { [key: string]: { sender: string; text: string }[] } = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  return NextResponse.json(messages[userId] || []);
}

export async function POST(req: Request) {
  const { userId, text } = await req.json();
  
  if (!userId || !text) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!messages[userId]) messages[userId] = [];
  messages[userId].push({ sender: "provider", text });

  return NextResponse.json({ success: true });
}
