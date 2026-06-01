import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return new NextResponse("Missing URL", { status: 400 });

  try {
    // 🚀 BROWSER BYPASS: Backend freely downloads the VTT from MinIO
    const response = await fetch(targetUrl);
    const text = await response.text();

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/vtt',
        'Access-Control-Allow-Origin': '*', // Browser ko shanti dega
      },
    });
  } catch (error) {
    return new NextResponse("Failed to fetch captions", { status: 500 });
  }
}