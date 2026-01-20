-- =====================================================
-- SQL PARA INTEGRAÇÃO DO PDF NO SISTEMA DE PROPOSTAS
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- ============================================
-- 1. ADICIONAR CAMPO pdf_path NA TABELA PROPOSTAS
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'propostas' AND column_name = 'pdf_path'
    ) THEN
        ALTER TABLE propostas ADD COLUMN pdf_path TEXT;
        COMMENT ON COLUMN propostas.pdf_path IS 'Caminho do PDF no Supabase Storage';
    END IF;
END $$;

-- ============================================
-- 2. CRIAR BUCKET PARA PDFs DAS PROPOSTAS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'propostas-pdf', 
    'propostas-pdf', 
    false,
    10485760,
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 3. POLÍTICAS DE ACESSO PARA O BUCKET propostas-pdf
-- ============================================
DROP POLICY IF EXISTS "Equipe pode ver PDFs de propostas" ON storage.objects;
DROP POLICY IF EXISTS "Equipe pode inserir PDFs de propostas" ON storage.objects;
DROP POLICY IF EXISTS "Equipe pode deletar PDFs de propostas" ON storage.objects;
DROP POLICY IF EXISTS "Acesso publico aos PDFs via token" ON storage.objects;

CREATE POLICY "Equipe pode ver PDFs de propostas"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'propostas-pdf'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Equipe pode inserir PDFs de propostas"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'propostas-pdf'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Equipe pode deletar PDFs de propostas"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'propostas-pdf'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Acesso publico aos PDFs via token"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'propostas-pdf'
);

-- ============================================
-- 4. CRIAR BUCKET PARA DOCUMENTOS DO CLIENTE
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-propostas', 
    'documentos-propostas', 
    false,
    10485760,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 5. POLÍTICAS PARA DOCUMENTOS DO CLIENTE
-- ============================================
DROP POLICY IF EXISTS "Cliente pode enviar documentos" ON storage.objects;
DROP POLICY IF EXISTS "Equipe pode ver documentos" ON storage.objects;
DROP POLICY IF EXISTS "Equipe pode deletar documentos" ON storage.objects;

CREATE POLICY "Cliente pode enviar documentos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documentos-propostas'
);

CREATE POLICY "Equipe pode ver documentos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documentos-propostas'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Equipe pode deletar documentos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documentos-propostas'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Acesso publico aos documentos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documentos-propostas'
);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
SELECT 'Script executado com sucesso!' AS resultado;
