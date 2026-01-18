

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    tier TEXT DEFAULT 'free' CHECK(tier IN ('free', 'pro', 'pro_max')),
    upload_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ip_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT UNIQUE NOT NULL,
    upload_count INTEGER DEFAULT 0,
    last_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ip_address ON ip_uploads(ip_address);

-- Images table with hash for duplicate detection (stores unique images)
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_hash TEXT UNIQUE NOT NULL,  -- Perceptual hash for similarity
    file_hash TEXT NOT NULL,          -- Exact file hash
    file_size INTEGER,
    filename TEXT,
    original_filename TEXT,
    analysis_result TEXT,             -- JSON with AI analysis
    is_manipulated BOOLEAN DEFAULT 0,
    confidence_score REAL,
    heatmap_filename TEXT,            -- Filename of heatmap overlay (if tampered)
    mask_filename TEXT,               -- Filename of segmentation mask (if tampered)
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_count INTEGER DEFAULT 1
);

-- Scans table - tracks each scan event (who, when, where)
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    user_id INTEGER,
    ip_address TEXT,
    source_site TEXT,                 -- e.g., "facebook.com"
    source_url TEXT,                  -- Full URL where image was found
    image_url TEXT,                   -- Direct URL to the image
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(image_id) REFERENCES images(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_image_hash ON images(image_hash);
CREATE INDEX IF NOT EXISTS idx_file_hash ON images(file_hash);
CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_image ON scans(image_id);
CREATE INDEX IF NOT EXISTS idx_scans_site ON scans(source_site);

CREATE TABLE IF NOT EXISTS tier_limits (
    tier TEXT PRIMARY KEY,
    max_uploads INTEGER,  
    description TEXT
);


INSERT OR IGNORE INTO tier_limits (tier, max_uploads, description) VALUES 
    ('anonymous', 3, 'Anonymous - 3 free uploads without signup'),
    ('free', 8, 'Free tier - 8 uploads (3 + 5 signup bonus)'),
    ('pro', 500, 'Pro tier - 500 uploads'),
    ('pro_max', NULL, 'Pro Max tier - Unlimited uploads');
