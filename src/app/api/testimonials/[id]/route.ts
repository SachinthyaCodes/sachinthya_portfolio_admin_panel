import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import { replaceImage, deleteImage } from '@/lib/storage'
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

// GET single testimonial
export async function GET(
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
    
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(testimonial)
  } catch (error: unknown) {
    console.error('Error fetching testimonial:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch testimonial'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// PATCH/PUT update testimonial
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

    const formData = await request.formData()
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const text = formData.get('text') as string
    const isShown = formData.get('isShown') === 'true'
    const orderIndex = parseInt(formData.get('orderIndex') as string) || 0
    const imageFile = formData.get('image') as File | null

    // Get current testimonial
    const { data: currentTestimonial, error: fetchError } = await supabase
      .from('testimonials')
      .select('image_url')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    let imageUrl = currentTestimonial.image_url

    // Handle image update
    if (imageFile && imageFile.size > 0) {
      if (currentTestimonial.image_url) {
        imageUrl = await replaceImage(currentTestimonial.image_url, imageFile, 'testimonials')
      } else {
        const { uploadImage } = await import('@/lib/storage')
        imageUrl = await uploadImage(imageFile, 'testimonials')
      }
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update({
        name,
        role,
        text,
        image_url: imageUrl,
        order_index: orderIndex,
        is_shown: isShown,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(testimonial)
  } catch (error: unknown) {
    console.error('Error updating testimonial:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update testimonial'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export const PUT = PATCH

// DELETE testimonial
export async function DELETE(
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

    // Get current testimonial to delete image
    const { data: testimonial, error: fetchError } = await supabase
      .from('testimonials')
      .select('image_url')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    // Delete image if exists
    if (testimonial.image_url) {
      await deleteImage(testimonial.image_url)
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Testimonial deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting testimonial:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete testimonial'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
