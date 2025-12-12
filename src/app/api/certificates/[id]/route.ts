import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client'
import { authenticateRequest } from '@/lib/auth'

// Map database fields to frontend format
function mapDbToFrontend(dbCertificate: Record<string, unknown>) {
  return {
    id: dbCertificate.id,
    provider: dbCertificate.provider,
    title: dbCertificate.title,
    link: dbCertificate.link,
    issuedDate: dbCertificate.issued_date,
    credentialType: dbCertificate.credential_type || 'certification',
    orderIndex: dbCertificate.order_index,
    isShown: dbCertificate.is_shown,
    createdAt: dbCertificate.created_at,
    updatedAt: dbCertificate.updated_at,
  }
}

// Map frontend fields to database format
function mapFrontendToDb(frontendCertificate: Record<string, unknown>) {
  const credentialType = frontendCertificate.credentialType === 'badge'
    ? 'badge'
    : 'certification'

  return {
    provider: frontendCertificate.provider,
    title: frontendCertificate.title,
    link: frontendCertificate.link || null,
    issued_date: frontendCertificate.issuedDate,
    credential_type: credentialType,
    order_index: frontendCertificate.orderIndex ?? 0,
    is_shown: frontendCertificate.isShown ?? true,
  }
}

// GET - Get single certificate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching certificate:', error)
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json(mapDbToFrontend(data))
  } catch (error) {
    console.error('Error in GET /api/certificates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT/PATCH - Update certificate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const supabase = createSupabaseClient()
    
    const dbData = mapFrontendToDb(body)
    
    const { data, error } = await supabase
      .from('certificates')
      .update(dbData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating certificate:', error)
      return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 })
    }

    return NextResponse.json(mapDbToFrontend(data))
  } catch (error) {
    console.error('Error in PUT /api/certificates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}

// DELETE - Delete certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting certificate:', error)
      return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/certificates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
