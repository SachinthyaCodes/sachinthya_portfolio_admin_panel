import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return typeof decoded === 'object' ? decoded as Record<string, unknown> : null
  } catch {
    return null
  }
}

// Reorder testimonials
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const token = getAuthToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { testimonials } = await request.json()

    if (!Array.isArray(testimonials)) {
      return NextResponse.json(
        { error: 'Testimonials array is required' },
        { status: 400 }
      )
    }

    // Update each testimonial's order_index
    const updates = testimonials.map(({ id, order_index }) =>
      supabase
        .from('testimonials')
        .update({ order_index })
        .eq('id', id)
    )

    await Promise.all(updates)

    return NextResponse.json({ message: 'Testimonials reordered successfully' })
  } catch (error: unknown) {
    console.error('Error reordering testimonials:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to reorder testimonials'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
