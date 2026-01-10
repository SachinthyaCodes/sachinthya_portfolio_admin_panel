-- Enable required extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- Documents table to group chunks
create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('pdf','docx','text')),
  content_preview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chunk table with pgvector
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references knowledge_documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(384),
  created_at timestamptz default now()
);

-- Vector index for faster similarity search
create index if not exists idx_knowledge_chunks_embedding
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Similarity search helper
create or replace function match_knowledge(
  query_embedding vector(384),
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select kc.id, kc.document_id, kc.content, kc.metadata,
         1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  where 1 - (kc.embedding <=> query_embedding) >= similarity_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;
