IF OBJECT_ID(N'[TWN].[dbo].[External_Client]', N'U') IS NULL
BEGIN
    CREATE TABLE [TWN].[dbo].[External_Client] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ClientId] NVARCHAR(100) NOT NULL UNIQUE,
        [ClientSecret] NVARCHAR(200) NOT NULL,
        [CallbackUrl] NVARCHAR(500) NOT NULL,
        [IsEnabled] BIT NOT NULL CONSTRAINT [DF_External_Client_IsEnabled] DEFAULT (1),
        [CreatedAt] DATETIME NOT NULL CONSTRAINT [DF_External_Client_CreatedAt] DEFAULT (GETDATE())
    );
END
GO

IF OBJECT_ID(N'[TWN].[dbo].[External_AuthorizationCode]', N'U') IS NULL
BEGIN
    CREATE TABLE [TWN].[dbo].[External_AuthorizationCode] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Code] NVARCHAR(100) NOT NULL UNIQUE,
        [WaterNo] NVARCHAR(50) NOT NULL,
        [UserId] NVARCHAR(100) NULL,
        [ClientId] NVARCHAR(100) NOT NULL,
        [CallbackUrl] NVARCHAR(500) NOT NULL,
        [State] NVARCHAR(200) NULL,
        [ExpiresAt] DATETIME NOT NULL,
        [Used] BIT NOT NULL CONSTRAINT [DF_External_AuthorizationCode_Used] DEFAULT (0),
        [CreatedAt] DATETIME NOT NULL CONSTRAINT [DF_External_AuthorizationCode_CreatedAt] DEFAULT (GETDATE()),
        [UsedAt] DATETIME NULL
    );

    CREATE INDEX [IX_External_AuthorizationCode_Code]
        ON [TWN].[dbo].[External_AuthorizationCode] ([Code]);

    CREATE INDEX [IX_External_AuthorizationCode_ExpiresAt_Used]
        ON [TWN].[dbo].[External_AuthorizationCode] ([ExpiresAt], [Used]);
END
GO

-- 範例：正式值請與對方約定後替換。
-- INSERT INTO [TWN].[dbo].[External_Client] ([ClientId], [ClientSecret], [CallbackUrl], [IsEnabled])
-- VALUES (N'penghu_smart_meter_app', N'請替換成長亂數密碼', N'https://partner.example.com/auth/callback', 1);
