-- ==============================================
-- SCRIPT: Adicionar campo auth_id na tabela usuarios
-- Execute este script no Supabase SQL Editor
-- ==============================================

-- 1. Adicionar coluna auth_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN auth_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Coluna auth_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna auth_id já existe.';
    END IF;
END $$;

-- 2. Criar índice para busca rápida por auth_id
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- 3. Verificar usuários sem auth_id vinculado
SELECT 
    id,
    nome,
    email,
    auth_id,
    CASE WHEN auth_id IS NULL THEN '⚠️ SEM VÍNCULO' ELSE '✅ OK' END as status
FROM usuarios
ORDER BY nome;

-- ==============================================
-- INSTRUÇÕES ADICIONAIS
-- ==============================================
-- 
-- Se você tiver usuários existentes que precisam ser vinculados
-- ao auth.users, você pode fazer assim:
--
-- UPDATE usuarios u
-- SET auth_id = a.id
-- FROM auth.users a
-- WHERE LOWER(u.email) = LOWER(a.email)
-- AND u.auth_id IS NULL;
--
-- ==============================================
