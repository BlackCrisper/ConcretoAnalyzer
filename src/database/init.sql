-- Criar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'client');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE file_type AS ENUM ('pdf', 'image', 'dwg');
CREATE TYPE file_status AS ENUM ('pending', 'processing', 'processed', 'error');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'error');
CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'error');

-- Criar tabelas
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id),
    status project_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    type file_type NOT NULL,
    path VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    status file_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE structural_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    file_id UUID NOT NULL REFERENCES project_files(id),
    type VARCHAR(50) NOT NULL,
    number VARCHAR(50) NOT NULL,
    dimensions JSONB NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE structural_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    status analysis_status NOT NULL DEFAULT 'pending',
    results JSONB,
    errors TEXT[],
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    analysis_id UUID NOT NULL REFERENCES structural_analysis(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    file_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shared_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES project_reports(id),
    user_id UUID NOT NULL REFERENCES users(id),
    access_level VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_structural_elements_project_id ON structural_elements(project_id);
CREATE INDEX idx_structural_elements_file_id ON structural_elements(file_id);
CREATE INDEX idx_structural_analysis_project_id ON structural_analysis(project_id);
CREATE INDEX idx_project_reports_project_id ON project_reports(project_id);
CREATE INDEX idx_project_reports_analysis_id ON project_reports(analysis_id);
CREATE INDEX idx_shared_reports_report_id ON shared_reports(report_id);
CREATE INDEX idx_shared_reports_user_id ON shared_reports(user_id);

-- Criar funções
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_structural_elements_updated_at
    BEFORE UPDATE ON structural_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_structural_analysis_updated_at
    BEFORE UPDATE ON structural_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_reports_updated_at
    BEFORE UPDATE ON project_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_reports_updated_at
    BEFORE UPDATE ON shared_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin inicial
INSERT INTO users (name, email, password, role)
VALUES (
    'Admin',
    'admin@estrutura.com',
    '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iq.8Yw0YqX5eG', -- senha: admin123
    'admin'
); 