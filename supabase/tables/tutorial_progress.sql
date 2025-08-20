CREATE TABLE tutorial_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    tutorial_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    current_step INTEGER DEFAULT 0,
    completed_steps TEXT[] DEFAULT '{}',
    total_steps INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc',
    NOW()),
    progress_data JSONB DEFAULT '{}'::jsonb
);