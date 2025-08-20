import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for demo environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create Supabase client (with demo mode support)
export const supabase: SupabaseClient = supabaseUrl === 'https://demo.supabase.co' 
  ? null as any // Demo mode - no real Supabase connection
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'hyperliquid-edu-auth',
        autoRefreshToken: true
      },
      global: {
        headers: {
          'X-Client-Info': 'hyperliquid-edu-dashboard@1.0.0'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

// Database types
export interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url?: string;
  xp_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  completed_steps: string[];
  current_step: number;
  completed: boolean;
  time_spent: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked_at: string;
}

export interface ApiUsageLog {
  id: string;
  user_id?: string;
  endpoint: string;
  method: string;
  status_code?: number;
  response_time_ms?: number;
  created_at: string;
  request_data?: any;
  response_data?: any;
  error_message?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  wallet_address: string;
  created_at: string;
  expires_at: string;
  last_used: string;
  is_active: boolean;
}

// Helper functions with demo mode support
export const getCurrentUser = async () => {
  if (!supabase) {
    // Demo mode - return mock user
    return {
      id: 'demo-user-123',
      email: 'demo@hyperliquid-edu.com',
      user_metadata: { wallet_address: 'demo-wallet' }
    };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  if (!supabase) {
    // Demo mode - return mock profile
    return {
      id: userId,
      wallet_address: 'demo-wallet-address',
      username: 'Demo User',
      avatar_url: null,
      xp_points: 150,
      level: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const getUserByWalletAddress = async (walletAddress: string): Promise<User | null> => {
  if (!supabase) {
    // Demo mode - return mock user
    return {
      id: 'demo-user-123',
      wallet_address: walletAddress.toLowerCase(),
      username: 'Demo User',
      avatar_url: null,
      xp_points: 150,
      level: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching user by wallet:', error);
    return null;
  }
  
  return data;
};

export const createOrUpdateUser = async (walletAddress: string, username?: string): Promise<User | null> => {
  if (!supabase) {
    // Demo mode - return mock user
    return {
      id: 'demo-user-123',
      wallet_address: walletAddress.toLowerCase(),
      username: username || 'Demo User',
      avatar_url: null,
      xp_points: 150,
      level: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  const normalizedAddress = walletAddress.toLowerCase();
  
  // First check if user exists
  let user = await getUserByWalletAddress(normalizedAddress);
  
  if (user) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({ 
        username: username || user.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        wallet_address: normalizedAddress,
        username: username || `User_${normalizedAddress.slice(-6)}`,
        xp_points: 0,
        level: 1
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  }
};

export const getUserProgress = async (userId: string, tutorialId?: string): Promise<TutorialProgress[]> => {
  if (!supabase) {
    // Demo mode - return mock progress
    return [
      {
        id: 'demo-progress-1',
        user_id: userId,
        tutorial_id: tutorialId || 'getting-started',
        completed_steps: ['step-1', 'step-2'],
        current_step: 2,
        completed: false,
        time_spent: 300,
        xp_earned: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  let query = supabase
    .from('tutorial_progress')
    .select('*')
    .eq('user_id', userId);
    
  if (tutorialId) {
    query = query.eq('tutorial_id', tutorialId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
  
  return data || [];
};

export const updateUserProgress = async (
  userId: string, 
  tutorialId: string, 
  progressData: Partial<TutorialProgress>
): Promise<TutorialProgress | null> => {
  if (!supabase) {
    // Demo mode - return mock updated progress
    return {
      id: 'demo-progress-1',
      user_id: userId,
      tutorial_id: tutorialId,
      completed_steps: progressData.completed_steps || [],
      current_step: progressData.current_step || 0,
      completed: progressData.completed || false,
      time_spent: progressData.time_spent || 0,
      xp_earned: progressData.xp_earned || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  // Check if progress exists
  const existingProgress = await getUserProgress(userId, tutorialId);
  
  if (existingProgress.length > 0) {
    // Update existing progress
    const { data, error } = await supabase
      .from('tutorial_progress')
      .update({
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating progress:', error);
      return null;
    }
    
    return data;
  } else {
    // Create new progress
    const { data, error } = await supabase
      .from('tutorial_progress')
      .insert({
        user_id: userId,
        tutorial_id: tutorialId,
        completed_steps: [],
        current_step: 0,
        completed: false,
        time_spent: 0,
        xp_earned: 0,
        ...progressData
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating progress:', error);
      return null;
    }
    
    return data;
  }
};

export const logApiUsage = async (logData: Omit<ApiUsageLog, 'id' | 'created_at'>): Promise<void> => {
  if (!supabase) {
    // Demo mode - just log to console
    console.log('[Demo] API Usage:', logData);
    return;
  }
  
  const { error } = await supabase
    .from('api_usage_logs')
    .insert({
      ...logData,
      created_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error logging API usage:', error);
  }
};

// Demo mode indicator
export const isDemoMode = () => !supabase;

export const updateUserXP = async (userId: string, xpToAdd: number): Promise<User | null> => {
  const { data, error } = await supabase.rpc('add_user_xp', {
    user_id: userId,
    xp_amount: xpToAdd
  });
  
  if (error) {
    console.error('Error updating user XP:', error);
    return null;
  }
  
  return data;
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  
  return data || [];
};

export const createUserSession = async (
  userId: string,
  sessionToken: string,
  walletAddress: string,
  expiresAt: string
): Promise<UserSession | null> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      wallet_address: walletAddress.toLowerCase(),
      expires_at: expiresAt
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user session:', error);
    return null;
  }
  
  return data;
};

export const validateUserSession = async (sessionToken: string): Promise<UserSession | null> => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
    
  if (error) {
    console.error('Error validating session:', error);
    return null;
  }
  
  return data;
};