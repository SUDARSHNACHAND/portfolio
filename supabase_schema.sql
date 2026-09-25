-- ================================================================
-- PORTFOLIO SECURE DATABASE ARCHITECTURE (POSTGRESQL / SUPABASE)
-- ================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 1. ADMINISTRATIVE & SECURITY TABLES (STRICT RLS)
-- ================================================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Stored as Argon2id ($argon2id$v=19$...)
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (
        role IN (
            'SUPER_ADMIN',
            'ADMIN',
            'EDITOR',
            'VIEWER'
        )
    ),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'disabled')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);

-- Admin Sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions (session_token);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions (expires_at);

-- Admin Roles & Permissions
CREATE TABLE IF NOT EXISTS admin_roles (
    role TEXT PRIMARY KEY,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    role TEXT NOT NULL REFERENCES admin_roles (role) ON DELETE CASCADE,
    permission TEXT NOT NULL
);

INSERT INTO
    admin_roles (role, description)
VALUES (
        'SUPER_ADMIN',
        'Full unrestricted administrative access'
    ),
    (
        'ADMIN',
        'Manage content, messages, and analytics'
    ),
    (
        'EDITOR',
        'Create and edit portfolio content drafts'
    ),
    (
        'VIEWER',
        'Read-only access to admin panels'
    ) ON CONFLICT (role) DO NOTHING;

-- Security & CMS Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES admin_users (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB, -- Safe non-sensitive metadata only (NO passwords, keys, secrets)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity_logs (timestamp);

-- ================================================================
-- 2. PORTFOLIO CONTENT TABLES (PUBLIC READ PUBLISHED ONLY)
-- ================================================================

-- Home Page Content
CREATE TABLE IF NOT EXISTS portfolio_home (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    hero_label TEXT NOT NULL DEFAULT 'HI, I AM',
    name TEXT NOT NULL DEFAULT 'SUDARSHNA CHAND M S',
    role TEXT NOT NULL DEFAULT 'DevOps Engineer',
    typing_text TEXT NOT NULL,
    description TEXT NOT NULL,
    profile_image TEXT,
    email TEXT NOT NULL,
    resume_url TEXT NOT NULL DEFAULT '/M.S.SUDARSHNA CHAND CV.pdf',
    resume_file_name TEXT NOT NULL DEFAULT 'M.S.SUDARSHNA CHAND CV.pdf',
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- About Section Content
CREATE TABLE IF NOT EXISTS portfolio_about (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_label TEXT NOT NULL DEFAULT 'ABOUT ME',
    heading TEXT NOT NULL,
    bio_p1 TEXT NOT NULL,
    bio_p2 TEXT NOT NULL,
    bio_p3 TEXT NOT NULL,
    tech_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Education Section
CREATE TABLE IF NOT EXISTS portfolio_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT NOT NULL,
    start_year TEXT NOT NULL,
    end_year TEXT NOT NULL,
    status_label TEXT NOT NULL DEFAULT 'Completed',
    branch TEXT NOT NULL,
    cgpa TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_education_order ON portfolio_education (display_order);

-- Experience & Recognition Section
CREATE TABLE IF NOT EXISTS portfolio_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    type TEXT NOT NULL CHECK (
        type IN (
            'internship',
            'achievement',
            'experience'
        )
    ),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    description TEXT NOT NULL,
    certificate_url TEXT,
    external_url TEXT,
    year TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_experience_order ON portfolio_experience (display_order);

-- Skills Section
CREATE TABLE IF NOT EXISTS portfolio_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    category TEXT NOT NULL CHECK (
        category IN (
            'FRONTEND',
            'BACKEND',
            'DATABASE',
            'DEVOPS',
            'AWS',
            'GIT',
            'MONITORING',
            'ENVIRONMENT',
            'DEVELOPER TOOLS'
        )
    ),
    name TEXT NOT NULL,
    icon_path TEXT NOT NULL,
    icon_type TEXT NOT NULL DEFAULT 'svg' CHECK (
        icon_type IN ('svg', 'webp', 'png', 'url')
    ),
    proficiency INTEGER DEFAULT 90 CHECK (proficiency BETWEEN 0 AND 100),
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (
        status IN ('draft', 'published')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_skills_cat ON portfolio_skills (category);

CREATE INDEX IF NOT EXISTS idx_skills_order ON portfolio_skills (display_order);

-- Projects Section
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number TEXT NOT NULL,
    tag TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON portfolio_projects (display_order);

CREATE INDEX IF NOT EXISTS idx_projects_status ON portfolio_projects (status, is_deleted);

-- Social Links
CREATE TABLE IF NOT EXISTS portfolio_socials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNREAD' CHECK (
        status IN (
            'UNREAD',
            'READ',
            'REPLIED',
            'ARCHIVED'
        )
    ),
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages (status);

-- Visitor Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    event_type TEXT NOT NULL,
    page_path TEXT NOT NULL,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    session_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_ts ON analytics_events (timestamp);

-- Resume Metadata
CREATE TABLE IF NOT EXISTS resume_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_home ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_about ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_education ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio_socials ENABLE ROW LEVEL SECURITY;

ALTER TABLE resume_metadata ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY published content
CREATE POLICY "Public can view published home" ON portfolio_home FOR
SELECT USING (status = 'published');

CREATE POLICY "Public can view published about" ON portfolio_about FOR
SELECT USING (status = 'published');

CREATE POLICY "Public can view published education" ON portfolio_education FOR
SELECT USING (status = 'published');

CREATE POLICY "Public can view published experience" ON portfolio_experience FOR
SELECT USING (status = 'published');

CREATE POLICY "Public can view published skills" ON portfolio_skills FOR
SELECT USING (status = 'published');

CREATE POLICY "Public can view published projects" ON portfolio_projects FOR
SELECT USING (
        status = 'published'
        AND is_deleted = FALSE
    );

CREATE POLICY "Public can view active socials" ON portfolio_socials FOR
SELECT USING (enabled = TRUE);

CREATE POLICY "Public can view active resume" ON resume_metadata FOR
SELECT USING (is_active = TRUE);

-- Public can insert anonymous analytics and contact messages
CREATE POLICY "Public can insert analytics events" ON analytics_events FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Public can submit contact messages" ON contact_messages FOR
INSERT
WITH
    CHECK (TRUE);