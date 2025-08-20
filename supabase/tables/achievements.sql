CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    metadata JSONB DEFAULT '{}'::jsonb
);