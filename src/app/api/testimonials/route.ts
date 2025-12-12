import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/storage'
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

// GET all testimonials
export async function GET(request: NextRequest) {
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

    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json(testimonials)
  } catch (error: unknown) {
    console.error('Error fetching testimonials:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch testimonials'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST new testimonial
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Testimonial POST started')
    const supabase = createSupabaseClient()
    const token = getAuthToken(request)
    console.log('🔑 Token present:', !!token)
    
    if (!token) {
      console.log('❌ No token provided')
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    console.log('🔐 JWT_SECRET present:', !!process.env.JWT_SECRET)
    const decoded = verifyToken(token)
    console.log('✅ Token decoded:', !!decoded, decoded ? `userId: ${decoded.userId}` : 'failed')
    
    if (!decoded) {
      console.log('❌ Invalid token')
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

    console.log('📝 Form data:', { name, role, text: text?.substring(0, 50), isShown, orderIndex, hasImage: !!imageFile })

    if (!name || !role || !text) {
      return NextResponse.json(
        { error: 'Name, role, and testimonial text are required' },
        { status: 400 }
      )
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      console.log('📸 Uploading image...')
      imageUrl = await uploadImage(imageFile, 'testimonials')
      console.log('✅ Image uploaded:', imageUrl)
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        user_id: decoded.userId,
        name,
        role,
        text,
        image_url: imageUrl,
        order_index: orderIndex,
        is_shown: isShown,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating testimonial:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create testimonial'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
