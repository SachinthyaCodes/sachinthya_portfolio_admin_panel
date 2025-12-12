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

// GET - Get all certificates
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('order_index', { ascending: true })
      .order('issued_date', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
    }

    const certificates = (data || []).map(mapDbToFrontend)
    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Error in GET /api/certificates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new certificate
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.provider || !body.title || !body.issuedDate) {
      return NextResponse.json(
        { error: 'Provider, title, and issued date are required' },
        { status: 400 }
      )
    }

    const credentialType = body.credentialType === 'badge' ? 'badge' : 'certification'

    const supabase = createSupabaseClient()
    
    const dbData = mapFrontendToDb({ ...body, credentialType })
    
    const { data, error } = await supabase
      .from('certificates')
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error('Error creating certificate:', error)
      return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
    }

    return NextResponse.json(mapDbToFrontend(data), { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/certificates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
