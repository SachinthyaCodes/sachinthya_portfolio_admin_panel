import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import { authenticateRequest } from '@/lib/auth'

// POST - Reorder certificates
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { certificates } = await request.json()

    if (!Array.isArray(certificates)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Update order_index for each certificate
    const updates = certificates.map(cert =>
      supabase
        .from('certificates')
        .update({ order_index: cert.orderIndex })
        .eq('id', cert.id)
    )

    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Error reordering certificates:', errors)
      return NextResponse.json({ error: 'Failed to reorder certificates' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/certificates/reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
