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

// Toggle testimonial visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current visibility
    const { data: currentTestimonial, error: fetchError } = await supabase
      .from('testimonials')
      .select('is_shown')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    // Toggle visibility
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update({ is_shown: !currentTestimonial.is_shown })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(testimonial)
  } catch (error: unknown) {
    console.error('Error toggling testimonial visibility:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle testimonial visibility'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
