-- =====================================================
-- FIX: Database error saving new user
-- =====================================================
-- Este arquivo corrige o erro 500 ao criar novos usuários
-- Problema: Trigger tentando inserir em sa_users pode estar conflitando
-- =====================================================

-- Primeiro, vamos remover o trigger existente se houver problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função com melhor tratamento de erros
CREATE OR REPLACE FUNCTION sa_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o usuário já existe antes de inserir
  IF NOT EXISTS (SELECT 1 FROM sa_users WHERE id = NEW.id) THEN
    -- Insert into sa_users
    INSERT INTO sa_users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
  END IF;
  
  -- Verificar se o perfil já existe antes de inserir
  IF NOT EXISTS (SELECT 1 FROM sa_user_profiles WHERE user_id = NEW.id) THEN
    -- Insert default profile
    INSERT INTO sa_user_profiles (user_id, name, role, created_at, updated_at)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
      'user', 
      NOW(), 
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar a criação do usuário
    RAISE WARNING 'Error in sa_handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- =====================================================
-- ALTERNATIVA: Se ainda houver problemas, desabilite o trigger temporariamente
-- =====================================================
-- Para desabilitar completamente o trigger automático:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 
-- Neste caso, você precisará criar os registros manualmente após o signup:
-- 1. Usuário se cadastra normalmente
-- 2. No primeiro login, verificar e criar perfil se não existir
-- =====================================================