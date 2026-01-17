

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
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

-- Images table with hash for duplicate detection
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip_address TEXT,  -- For anonymous uploads
    filename TEXT,
    original_filename TEXT,
    image_hash TEXT NOT NULL,  
    file_hash TEXT NOT NULL,   
    file_size INTEGER,
    mask_filename TEXT,
    result_filename TEXT,
    analysis_result TEXT,  
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);


CREATE INDEX IF NOT EXISTS idx_image_hash ON images(image_hash);
CREATE INDEX IF NOT EXISTS idx_file_hash ON images(file_hash);
CREATE INDEX IF NOT EXISTS idx_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_address_images ON images(ip_address);

CREATE TABLE IF NOT EXISTS tier_limits (
    tier TEXT PRIMARY KEY,
    max_uploads INTEGER,  
    description TEXT
);


INSERT OR IGNORE INTO tier_limits (tier, max_uploads, description) VALUES 
    ('free', 10, 'Free tier - 10 uploads per IP'),
    ('pro', 500, 'Pro tier - 500 uploads'),
    ('pro_max', NULL, 'Pro Max tier - Unlimited uploads');
