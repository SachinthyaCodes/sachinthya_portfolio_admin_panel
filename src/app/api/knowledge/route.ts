import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createSupabaseClient } from '@/lib/supabase-client'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { HfInference } from '@huggingface/inference'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB to stay within free-tier limits
const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const HF_MODEL = process.env.HF_EMBEDDING_MODEL || 'intfloat/multilingual-e5-small'

async function parseFile(file: File): Promise<{ text: string; sourceType: 'pdf' | 'docx' | 'text' }> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (file.type === 'application/pdf') {
    const pdf = await pdfParse(buffer)
    return { text: pdf.text, sourceType: 'pdf' }
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value, sourceType: 'docx' }
  }

  // Fallback to plain text
  return { text: buffer.toString('utf-8'), sourceType: 'text' }
}

function sanitizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export async function GET(request: NextRequest) {
  const authResult = authenticateRequest(request)
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('id,title,source_type,content_preview,created_at,updated_at,knowledge_chunks(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Knowledge GET error:', error)
    return NextResponse.json({ error: 'Failed to load knowledge documents' }, { status: 500 })
  }

  interface DbDocument {
    id: string
    title: string
    source_type: string
    content_preview?: string
    created_at?: string
    updated_at?: string
    knowledge_chunks?: Array<{ count?: number }>
  }

  const documents = (data || []).map((doc: DbDocument) => ({
    id: doc.id,
    title: doc.title,
    sourceType: doc.source_type,
    contentPreview: doc.content_preview,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    chunkCount: Array.isArray(doc.knowledge_chunks) ? doc.knowledge_chunks[0]?.count ?? 0 : 0,
  }))

  return NextResponse.json({ documents })
}

export async function POST(request: NextRequest) {
  const authResult = authenticateRequest(request)
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawTextInput = formData.get('text') as string | null
    const titleInput = (formData.get('title') as string | null)?.trim()

    if (!file && !rawTextInput) {
      return NextResponse.json({ error: 'Provide a PDF, DOCX, TXT file or paste text.' }, { status: 400 })
    }

    let text = rawTextInput ? sanitizeText(rawTextInput) : ''
    let sourceType: 'pdf' | 'docx' | 'text' = 'text'
    let resolvedTitle = titleInput || 'Untitled'

    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File too large. Max 2MB on free tier.' }, { status: 400 })
      }
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 })
      }

      resolvedTitle = titleInput || file.name
      const parsed = await parseFile(file)
      text = sanitizeText(parsed.text)
      sourceType = parsed.sourceType
    }

    if (!text || text.length < 20) {
      return NextResponse.json({ error: 'Content too short to index.' }, { status: 400 })
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 80,
    })
    const docs = await splitter.createDocuments([text])
    const chunks = docs.map((d, idx) => ({
      chunk: d.pageContent.trim(),
      index: idx,
    })).filter(c => c.chunk.length > 0)

    if (!chunks.length) {
      return NextResponse.json({ error: 'No usable chunks found.' }, { status: 400 })
    }

    const hf = new HfInference(process.env.HF_API_KEY)

    const embeddingPromises = chunks.map(async (c) => {
      const response = await hf.featureExtraction({
        model: HF_MODEL,
        inputs: c.chunk,
      })
      return Array.isArray(response) ? response : [response]
    })

    const embeddings = await Promise.all(embeddingPromises)

    const supabase = createSupabaseClient()

    const { data: docRow, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        title: resolvedTitle,
        source_type: sourceType,
        content_preview: text.slice(0, 300),
      })
      .select()
      .single()

    if (docError || !docRow) {
      console.error('Insert document error:', docError)
      return NextResponse.json({ error: 'Failed to save document metadata.' }, { status: 500 })
    }

    const records = chunks.map((c, i) => ({
      document_id: docRow.id,
      chunk_index: i,
      content: c.chunk,
      metadata: {
        title: resolvedTitle,
        sourceType,
      },
      embedding: embeddings[i],
    }))

    const { error: chunkError } = await supabase
      .from('knowledge_chunks')
      .insert(records)

    if (chunkError) {
      console.error('Insert chunks error:', chunkError)
      // cleanup document if chunks fail
      await supabase.from('knowledge_documents').delete().eq('id', docRow.id)
      return NextResponse.json({ error: 'Failed to save chunks.' }, { status: 500 })
    }

    return NextResponse.json({
      document: {
        id: docRow.id,
        title: docRow.title,
        sourceType,
        contentPreview: docRow.content_preview,
        chunkCount: records.length,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Knowledge POST error:', error)
    return NextResponse.json({ error: 'Failed to ingest document.' }, { status: 500 })
  }
}
