import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import { authenticateRequest } from '@/lib/auth'

// POST - Toggle certificate visibility
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    
    // Get current certificate
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('is_shown')
      .eq('id', params.id)
      .single()

    if (fetchError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Toggle visibility
    const { data, error } = await supabase
      .from('certificates')
      .update({ is_shown: !certificate.is_shown })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling certificate visibility:', error)
      return NextResponse.json({ error: 'Failed to toggle visibility' }, { status: 500 })
    }

    return NextResponse.json({ isShown: data.is_shown })
  } catch (error) {
    console.error('Error in POST /api/certificates/[id]/toggle-visibility:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
