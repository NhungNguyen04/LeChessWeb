import { NextRequest, NextResponse } from 'next/server';

let whiteMove: string | null = null;
let blackMove: string | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { move, color } = body;
    
    if (typeof move !== 'string' || move.length !== 4 || (color !== 'white' && color !== 'black')) {
      return NextResponse.json({ error: 'Invalid move format or color' }, { status: 400 });
    }

    if (color === 'white') {
      whiteMove = move;
    } else {
      blackMove = move;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const color = request.nextUrl.searchParams.get('color');
  
  if (color === 'white') {
    const move = whiteMove;
    whiteMove = null; // Clear after reading
    return NextResponse.json({ move });
  } else if (color === 'black') {
    const move = blackMove;
    blackMove = null; // Clear after reading
    return NextResponse.json({ move });
  } else {
    return NextResponse.json({ error: 'Invalid color parameter' }, { status: 400 });
  }
}

