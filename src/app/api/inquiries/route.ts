import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createSupabaseClient } from '@/lib/supabase-client'
import { sendNewInquiryNotification } from '@/lib/email'

// POST - Create new inquiry (public endpoint for contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required: name, email, subject, message' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Insert inquiry into database
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new',
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating inquiry:', error)
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      )
    }

    // Send email notification (don't block response if email fails)
    sendNewInquiryNotification({
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
      message: inquiry.message,
      createdAt: inquiry.created_at
    }).catch(err => {
      console.error('Email notification failed (non-blocking):', err)
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Inquiry submitted successfully',
        id: inquiry.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/inquiries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET all inquiries
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'new', 'in-progress', 'resolved'
    const isRead = searchParams.get('is_read') // 'true', 'false'

    const supabase = createSupabaseClient()
    
    // Build query
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status)
    }
    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching inquiries:', error)
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/inquiries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE inquiry by ID (bulk delete support)
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing inquiry IDs' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting inquiries:', error)
      return NextResponse.json({ error: 'Failed to delete inquiries' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Inquiries deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/inquiries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
