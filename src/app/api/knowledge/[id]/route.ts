import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createSupabaseClient } from '@/lib/supabase-client'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = authenticateRequest(request)
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const supabase = createSupabaseClient()
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Document id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Knowledge DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Document deleted' })
}
