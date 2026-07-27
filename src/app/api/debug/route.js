import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' 

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      status: 'OK',
      authenticated: !!session,
      session: session,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET ❌',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET ✅' : 'NOT SET ❌',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
      },
      cookies: req.cookies.getAll(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
