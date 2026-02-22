-- Tabla y Storage para el sistema de documentos de Lexia.
-- Ejecutar en el SQL Editor de Supabase (o con la CLI).

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  extracted_text TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para listar por usuario
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents (user_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents (created_at DESC);

-- RLS: cada usuario solo ve sus documentos (ajustar si usas auth.uid())
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON public.documents FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Bucket de Storage (crear desde Dashboard > Storage o con API)
-- Nombre del bucket: documents
-- Público: no. Políticas: permitir upload/read con RLS por user_id si usas auth.
