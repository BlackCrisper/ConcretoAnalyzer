-- Criar banco de dados
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StructuralAnalysis')
BEGIN
    CREATE DATABASE StructuralAnalysis;
END

USE StructuralAnalysis;
GO

-- Criar tabela de usuários
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- Criar tabela de projetos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Projects]') AND type in (N'U'))
BEGIN
    CREATE TABLE Projects (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX),
        user_id UNIQUEIDENTIFIER NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'draft',
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );
END

-- Criar tabela de arquivos do projeto
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProjectFiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE ProjectFiles (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        project_id UNIQUEIDENTIFIER NOT NULL,
        name NVARCHAR(100) NOT NULL,
        type NVARCHAR(10) NOT NULL,
        path NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id)
    );
END

-- Criar tabela de elementos estruturais
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StructuralElements]') AND type in (N'U'))
BEGIN
    CREATE TABLE StructuralElements (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        project_id UNIQUEIDENTIFIER NOT NULL,
        type NVARCHAR(20) NOT NULL,
        number NVARCHAR(20) NOT NULL,
        dimensions NVARCHAR(MAX) NOT NULL,
        materials NVARCHAR(MAX) NOT NULL,
        location NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id)
    );
END

-- Criar tabela de tabelas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tables]') AND type in (N'U'))
BEGIN
    CREATE TABLE Tables (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        project_id UNIQUEIDENTIFIER NOT NULL,
        type NVARCHAR(50) NOT NULL,
        data NVARCHAR(MAX) NOT NULL,
        location NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id)
    );
END

-- Criar tabela de notas técnicas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TechnicalNotes]') AND type in (N'U'))
BEGIN
    CREATE TABLE TechnicalNotes (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        project_id UNIQUEIDENTIFIER NOT NULL,
        type NVARCHAR(50) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        location NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id)
    );
END

-- Criar tabela de relatórios do projeto
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProjectReports]') AND type in (N'U'))
BEGIN
    CREATE TABLE ProjectReports (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        project_id UNIQUEIDENTIFIER NOT NULL,
        elements NVARCHAR(MAX) NOT NULL,
        total_area DECIMAL(10,2) NOT NULL,
        total_concrete DECIMAL(10,2) NOT NULL,
        total_steel DECIMAL(10,2) NOT NULL,
        inconsistencies NVARCHAR(MAX) NOT NULL,
        optimizations NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id)
    );
END

-- Criar índices
CREATE INDEX IF NOT EXISTS IX_Projects_UserId ON Projects(user_id);
CREATE INDEX IF NOT EXISTS IX_ProjectFiles_ProjectId ON ProjectFiles(project_id);
CREATE INDEX IF NOT EXISTS IX_StructuralElements_ProjectId ON StructuralElements(project_id);
CREATE INDEX IF NOT EXISTS IX_Tables_ProjectId ON Tables(project_id);
CREATE INDEX IF NOT EXISTS IX_TechnicalNotes_ProjectId ON TechnicalNotes(project_id);
CREATE INDEX IF NOT EXISTS IX_ProjectReports_ProjectId ON ProjectReports(project_id);

-- Criar usuário administrador padrão
IF NOT EXISTS (SELECT * FROM Users WHERE email = 'admin@example.com')
BEGIN
    INSERT INTO Users (name, email, password, role)
    VALUES (
        'Administrador',
        'admin@example.com',
        -- Senha: Admin@123 (hash bcrypt)
        '$2a$10$X7UrY9qVqVqVqVqVqVqVqOqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVq',
        'admin'
    );
END 