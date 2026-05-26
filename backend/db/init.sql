-- KROS Database Schema
-- PostgreSQL 16

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(255) NOT NULL,
    access        VARCHAR(50)  NOT NULL DEFAULT 'staff', -- admin|manager|staff
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login    TIMESTAMPTZ
);

-- Skills metadata (content lives in file store / SharePoint)
CREATE TABLE IF NOT EXISTS skills (
    id              VARCHAR(100) PRIMARY KEY,   -- e.g. "hse_ptw"
    title           VARCHAR(255) NOT NULL,
    module          VARCHAR(50)  NOT NULL,       -- ops|hse|hrm|fin|proj|maint|env
    owner_role      VARCHAR(255),
    sensitivity     VARCHAR(20)  NOT NULL DEFAULT 'low', -- low|medium|high
    status          VARCHAR(20)  NOT NULL DEFAULT 'fresh', -- fresh|stale|urgent
    last_updated    DATE,
    next_review     DATE,
    file_path       VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Skill version history
CREATE TABLE IF NOT EXISTS skill_history (
    id           SERIAL PRIMARY KEY,
    skill_id     VARCHAR(100) REFERENCES skills(id),
    version      INTEGER      NOT NULL DEFAULT 1,
    content      TEXT         NOT NULL,
    change_note  TEXT,
    changed_by   INTEGER      REFERENCES users(id),
    changed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- AI chat logs (for analytics and audit)
CREATE TABLE IF NOT EXISTS chat_logs (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER      REFERENCES users(id),
    session_id   VARCHAR(100),
    role         VARCHAR(20)  NOT NULL, -- user|assistant
    content      TEXT         NOT NULL,
    engine       VARCHAR(50),           -- claude|deepseek
    model        VARCHAR(100),
    sensitivity  VARCHAR(20),
    skill_ref    VARCHAR(100),
    tokens_used  INTEGER,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Succession matrix
CREATE TABLE IF NOT EXISTS succession (
    id           SERIAL PRIMARY KEY,
    role         VARCHAR(255) UNIQUE NOT NULL,
    current_name VARCHAR(255),
    ready_now    VARCHAR(255),
    r12_months   VARCHAR(255),
    r24_months   VARCHAR(255),
    risk         VARCHAR(20)  NOT NULL DEFAULT 'critical', -- critical|at-risk|managed
    notes        TEXT,
    updated_by   INTEGER      REFERENCES users(id),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Exit capture sessions
CREATE TABLE IF NOT EXISTS exit_sessions (
    id           SERIAL PRIMARY KEY,
    staff_name   VARCHAR(255) NOT NULL,
    staff_role   VARCHAR(255),
    department   VARCHAR(100),
    session_date DATE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending|in-progress|completed
    score        INTEGER,         -- 0-100 knowledge capture score
    conducted_by INTEGER      REFERENCES users(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Exit session answers
CREATE TABLE IF NOT EXISTS exit_answers (
    id             SERIAL PRIMARY KEY,
    session_id     INTEGER      REFERENCES exit_sessions(id),
    question_index INTEGER      NOT NULL,
    question_text  TEXT         NOT NULL,
    answer_text    TEXT,
    skill_refs     TEXT[],      -- array of skill IDs referenced
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Compliance items
CREATE TABLE IF NOT EXISTS compliance_items (
    id           SERIAL PRIMARY KEY,
    category     VARCHAR(100) NOT NULL,
    item         VARCHAR(255) NOT NULL,
    deadline     DATE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'upcoming', -- overdue|due|upcoming|done
    authority    VARCHAR(100),
    amount       VARCHAR(100),
    skill_ref    VARCHAR(100),
    notes        TEXT,
    completed_by INTEGER      REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id           SERIAL PRIMARY KEY,
    type         VARCHAR(20)  NOT NULL, -- urgent|warn|info
    message      TEXT         NOT NULL,
    skill_ref    VARCHAR(100),
    dismissed    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id    ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_skills_module        ON skills(module);
CREATE INDEX IF NOT EXISTS idx_skills_status        ON skills(status);

-- Insert demo data
INSERT INTO succession (role, current_name, ready_now, r12_months, r24_months, risk) VALUES
('Mine Manager',            'Ahmad Zulkifli',  'Raj Namasivayam',  'Nur Hidayah',   '—',               'managed'),
('Mine Ops Superintendent', 'Raj Namasivayam', '—',                'Siti Aminah',   'Chong Wei Lim',   'critical'),
('HSE Manager',             'Farah Izzati',    'Mohd Asyraf',      'Nadia bt Hamid','—',               'managed'),
('Chief Metallurgist',      'Lee Kah Wai',     '—',                '—',             'Priya Subramaniam','critical'),
('Finance Manager',         'Tan Mei Ling',    '—',                'Nurul Ain',     '—',               'at-risk'),
('Maintenance Super.',      'Haji Rosli',      'Amirul Haziq',     'Kevin Tan',     '—',               'managed')
ON CONFLICT (role) DO NOTHING;

INSERT INTO compliance_items (category, item, deadline, status, authority, skill_ref, amount) VALUES
('Statutory',   'EPF Submission',        '2025-05-15', 'due',      'KWSP',       'hrm_payroll', 'RM 48,200'),
('Statutory',   'SOCSO Submission',      '2025-05-15', 'due',      'PERKESO',    'hrm_payroll', 'RM 6,840'),
('Statutory',   'HRDF Levy',             '2025-05-15', 'due',      'HRD Corp',   'hrm_payroll', 'RM 2,100'),
('Environment', 'DOE Discharge Report',  '2025-05-14', 'overdue',  'DOE',        'env_report',  '—'),
('Royalty',     'State Mineral Royalty', '2025-06-30', 'upcoming', 'JMG Pahang', 'fin_royalty', 'RM 184,200'),
('HSE',         'DOSH Annual Return',    '2025-06-01', 'upcoming', 'DOSH',       'hse_hazop',   '—')
ON CONFLICT DO NOTHING;
