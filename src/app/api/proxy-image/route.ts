import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) return NextResponse.json({ error: "URL missing" }, { status: 400 });

    try {
        const response = await fetch(imageUrl);
        const imageBuffer = await response.arrayBuffer();
        
        return new Response(imageBuffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "image/png",
                "Cache-Control": "public, max-age=86400"
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
