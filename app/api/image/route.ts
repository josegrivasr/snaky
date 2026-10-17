import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WEEK = 'public, max-age=604800, stale-while-revalidate=86400';

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src') || '';
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return NextResponse.json({ error: 'Bad image' }, { status: 400 });
  }

  if (url.protocol !== 'https:' || url.hostname !== 'files.stripe.com') {
    return NextResponse.json({ error: 'Bad image' }, { status: 400 });
  }

  const upstream = await fetch(url, { cache: 'no-store' });
  const type = upstream.headers.get('content-type') || '';
  if (!upstream.ok || !upstream.body || !type.startsWith('image/')) {
    return NextResponse.json({ error: 'Image unavailable' }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': WEEK,
      'Vercel-CDN-Cache-Control': WEEK,
    },
  });
}
