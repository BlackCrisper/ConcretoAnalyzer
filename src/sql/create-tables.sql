-- Companies Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Companies') AND type in (N'U'))
BEGIN
    CREATE TABLE Companies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100),
        phone NVARCHAR(20),
        address NVARCHAR(255),
        active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE()
    );

    -- Insert default company
    INSERT INTO Companies (name, email, phone, address)
    VALUES ('Empresa Principal', 'contato@empresa.com', '(00) 0000-0000', 'Av. Principal, 123');
END;

-- Branches Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Branches') AND type in (N'U'))
BEGIN
    CREATE TABLE Branches (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        company_id INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (company_id) REFERENCES Companies(id)
    );

    -- Insert default branch
    INSERT INTO Branches (name, company_id)
    VALUES ('Matriz', 1);
END;

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Users') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL, -- 'user', 'admin', 'superadmin'
        company_id INT NOT NULL,
        branch_id INT NULL,
        active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        last_login DATETIME NULL,
        FOREIGN KEY (company_id) REFERENCES Companies(id),
        FOREIGN KEY (branch_id) REFERENCES Branches(id)
    );

    -- Insert default admin user (password: admin123)
    INSERT INTO Users (name, email, password_hash, role, company_id, branch_id)
    VALUES ('Admin', 'admin@exemplo.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 1, 1);

    -- Insert default superadmin user (password: super123)
    INSERT INTO Users (name, email, password_hash, role, company_id)
    VALUES ('Super Admin', 'superadmin@exemplo.com', '46f0823a89553618829bbdbd0a32a601f7bc898be43a5ed6bd260dc6f3cf6d93', 'superadmin', 1);

    -- Insert default regular user (password: user123)
    INSERT INTO Users (name, email, password_hash, role, company_id, branch_id)
    VALUES ('Usuário Comum', 'user@exemplo.com', '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb', 'user', 1, 1);
END;

-- Permissions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Permissions') AND type in (N'U'))
BEGIN
    CREATE TABLE Permissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        permission_code NVARCHAR(50) NOT NULL UNIQUE,
        description NVARCHAR(255) NOT NULL,
        category NVARCHAR(50) NOT NULL
    );

    -- Insert default permissions
    INSERT INTO Permissions (permission_code, description, category)
    VALUES
        ('view:dashboard', 'Visualizar Dashboard', 'Dashboard'),
        ('view:clients', 'Visualizar Clientes', 'Clientes'),
        ('create:client', 'Criar Clientes', 'Clientes'),
        ('edit:client', 'Editar Clientes', 'Clientes'),
        ('delete:client', 'Excluir Clientes', 'Clientes'),
        ('view:projects', 'Visualizar Projetos', 'Projetos'),
        ('create:project', 'Criar Projetos', 'Projetos'),
        ('edit:project', 'Editar Projetos', 'Projetos'),
        ('delete:project', 'Excluir Projetos', 'Projetos'),
        ('view:reports', 'Visualizar Relatórios', 'Relatórios'),
        ('view:settings', 'Visualizar Configurações', 'Configurações'),
        ('view:users', 'Visualizar Usuários', 'Usuários'),
        ('create:user', 'Criar Usuários', 'Usuários'),
        ('edit:user', 'Editar Usuários', 'Usuários'),
        ('delete:user', 'Excluir Usuários', 'Usuários'),
        ('view:companies', 'Visualizar Empresas', 'Empresas'),
        ('create:company', 'Criar Empresas', 'Empresas'),
        ('edit:company', 'Editar Empresas', 'Empresas'),
        ('delete:company', 'Excluir Empresas', 'Empresas'),
        ('manage:invitations', 'Gerenciar Convites', 'Convites'),
        ('manage:branches', 'Gerenciar Filiais', 'Filiais'),
        ('manage:notifications', 'Gerenciar Notificações', 'Notificações');
END;

-- User Permissions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'UserPermissions') AND type in (N'U'))
BEGIN
    CREATE TABLE UserPermissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        permission_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES Permissions(id) ON DELETE CASCADE,
        CONSTRAINT UC_UserPermission UNIQUE (user_id, permission_id)
    );

    -- Insert default permissions for admin user
    DECLARE @admin_id INT = (SELECT id FROM Users WHERE email = 'admin@exemplo.com');
    DECLARE @permission_id INT;

    DECLARE permission_cursor CURSOR FOR
    SELECT id FROM Permissions WHERE permission_code IN (
        'view:dashboard', 'view:clients', 'view:projects', 'view:reports', 'view:settings', 'view:users',
        'create:client', 'create:project', 'create:user',
        'edit:client', 'edit:project', 'edit:user',
        'delete:client', 'delete:project', 'delete:user',
        'manage:invitations', 'manage:branches', 'manage:notifications'
    );

    OPEN permission_cursor;
    FETCH NEXT FROM permission_cursor INTO @permission_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO UserPermissions (user_id, permission_id) VALUES (@admin_id, @permission_id);
        FETCH NEXT FROM permission_cursor INTO @permission_id;
    END

    CLOSE permission_cursor;
    DEALLOCATE permission_cursor;

    -- Insert default permissions for superadmin user
    DECLARE @superadmin_id INT = (SELECT id FROM Users WHERE email = 'superadmin@exemplo.com');

    DECLARE superadmin_cursor CURSOR FOR
    SELECT id FROM Permissions;

    OPEN superadmin_cursor;
    FETCH NEXT FROM superadmin_cursor INTO @permission_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO UserPermissions (user_id, permission_id) VALUES (@superadmin_id, @permission_id);
        FETCH NEXT FROM superadmin_cursor INTO @permission_id;
    END

    CLOSE superadmin_cursor;
    DEALLOCATE superadmin_cursor;

    -- Insert default permissions for regular user
    DECLARE @user_id INT = (SELECT id FROM Users WHERE email = 'user@exemplo.com');

    DECLARE user_cursor CURSOR FOR
    SELECT id FROM Permissions WHERE permission_code IN (
        'view:dashboard', 'view:clients', 'view:projects', 'view:reports',
        'create:project', 'edit:project'
    );

    OPEN user_cursor;
    FETCH NEXT FROM user_cursor INTO @permission_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO UserPermissions (user_id, permission_id) VALUES (@user_id, @permission_id);
        FETCH NEXT FROM user_cursor INTO @permission_id;
    END

    CLOSE user_cursor;
    DEALLOCATE user_cursor;
END;

-- Invitations Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Invitations') AND type in (N'U'))
BEGIN
    CREATE TABLE Invitations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL,
        branch_id INT NULL,
        expires_at DATE NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        accepted_at DATETIME NULL,
        status NVARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'aceito', 'expirado'
        token NVARCHAR(255) NOT NULL UNIQUE,
        FOREIGN KEY (branch_id) REFERENCES Branches(id)
    );
END;

-- Invitation Permissions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'InvitationPermissions') AND type in (N'U'))
BEGIN
    CREATE TABLE InvitationPermissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        invitation_id INT NOT NULL,
        permission_id INT NOT NULL,
        FOREIGN KEY (invitation_id) REFERENCES Invitations(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES Permissions(id) ON DELETE CASCADE,
        CONSTRAINT UC_InvitationPermission UNIQUE (invitation_id, permission_id)
    );
END;

-- Notification Preferences Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'NotificationPreferences') AND type in (N'U'))
BEGIN
    CREATE TABLE NotificationPreferences (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        type NVARCHAR(50) NOT NULL, -- 'project_update', 'new_user', etc.
        enabled BIT DEFAULT 1,
        frequency NVARCHAR(20) NULL, -- 'daily', 'weekly', 'monthly'
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT UC_UserNotificationPreference UNIQUE (user_id, type)
    );
END;

-- Projects Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Projects') AND type in (N'U'))
BEGIN
    CREATE TABLE Projects (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX) NULL,
        company_id INT NOT NULL,
        branch_id INT NULL,
        created_by INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        status NVARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'concluído', 'arquivado'
        FOREIGN KEY (company_id) REFERENCES Companies(id),
        FOREIGN KEY (branch_id) REFERENCES Branches(id),
        FOREIGN KEY (created_by) REFERENCES Users(id)
    );
END;

-- Project Files Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ProjectFiles') AND type in (N'U'))
BEGIN
    CREATE TABLE ProjectFiles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_id INT NOT NULL,
        filename NVARCHAR(255) NOT NULL,
        file_path NVARCHAR(MAX) NOT NULL,
        file_type NVARCHAR(50) NOT NULL,
        file_size INT NOT NULL,
        uploaded_by INT NOT NULL,
        uploaded_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES Users(id)
    );
END;

-- Project History Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ProjectHistory') AND type in (N'U'))
BEGIN
    CREATE TABLE ProjectHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        project_id INT NOT NULL,
        action NVARCHAR(50) NOT NULL, -- 'created', 'updated', 'file_added', etc.
        description NVARCHAR(MAX) NULL,
        user_id INT NOT NULL,
        timestamp DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );
END;

-- Password Resets Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PasswordResets') AND type in (N'U'))
BEGIN
    CREATE TABLE PasswordResets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        token NVARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
END;

-- Notifications Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Notifications') AND type in (N'U'))
BEGIN
    CREATE TABLE Notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        type NVARCHAR(20) NOT NULL, -- 'info', 'success', 'warning', 'error'
        read BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_Notifications_UserId ON Notifications(user_id);
    CREATE INDEX IX_Notifications_CreatedAt ON Notifications(created_at DESC);
END;
