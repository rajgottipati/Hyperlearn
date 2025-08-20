CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    preferences JSONB DEFAULT '{}'::jsonb
);