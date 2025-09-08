-- Criar tabela de repositórios
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL UNIQUE, -- ex: "owner/repo"
  description TEXT,
  url VARCHAR(500) NOT NULL,
  clone_url VARCHAR(500),
  ssh_url VARCHAR(500),
  html_url VARCHAR(500),
  language VARCHAR(100),
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  size_kb INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  is_fork BOOLEAN DEFAULT false,
  has_issues BOOLEAN DEFAULT true,
  has_projects BOOLEAN DEFAULT true,
  has_wiki BOOLEAN DEFAULT true,
  default_branch VARCHAR(100) DEFAULT 'main',
  owner_login VARCHAR(255),
  owner_avatar_url VARCHAR(500),
  topics TEXT[], -- Array de strings para tópicos/tags
  license_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  github_created_at TIMESTAMP WITH TIME ZONE,
  github_updated_at TIMESTAMP WITH TIME ZONE,
  github_pushed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados adicionais
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  notes TEXT,
  category VARCHAR(100), -- frontend, backend, fullstack, mobile, etc.
  priority INTEGER DEFAULT 0, -- 0 = normal, 1 = high, -1 = low
  
  -- Índices para performance
  CONSTRAINT repositories_full_name_unique UNIQUE (full_name)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_repositories_owner_login ON repositories(owner_login);
CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(language);
CREATE INDEX IF NOT EXISTS idx_repositories_status ON repositories(status);
CREATE INDEX IF NOT EXISTS idx_repositories_category ON repositories(category);
CREATE INDEX IF NOT EXISTS idx_repositories_priority ON repositories(priority);
CREATE INDEX IF NOT EXISTS idx_repositories_created_at ON repositories(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_repositories_updated_at 
    BEFORE UPDATE ON repositories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Opcional, dependendo das suas necessidades de segurança
-- ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- Comentários na tabela
COMMENT ON TABLE repositories IS 'Tabela para armazenar informações dos repositórios GitHub';
COMMENT ON COLUMN repositories.full_name IS 'Nome completo do repositório no formato owner/repo';
COMMENT ON COLUMN repositories.topics IS 'Array de tópicos/tags do repositório';
COMMENT ON COLUMN repositories.status IS 'Status do repositório: active, archived, deleted';
COMMENT ON COLUMN repositories.priority IS 'Prioridade do repositório: -1=low, 0=normal, 1=high';