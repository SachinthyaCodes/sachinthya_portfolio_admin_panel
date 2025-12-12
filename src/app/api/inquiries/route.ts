import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createSupabaseClient } from '@/lib/supabase-client'

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
