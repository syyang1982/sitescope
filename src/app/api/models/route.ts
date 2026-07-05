import { AVAILABLE_MODELS } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(AVAILABLE_MODELS);
}
