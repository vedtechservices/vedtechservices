import { supabase } from './supabase';

export interface ActivityLog {
  user_id: string;
  user_name?: string;
  user_role?: string;
  action: string;
  target_id?: string;
  target_type?: string;
  details?: any;
}

/**
 * Logs an activity into the database for audit purposes
 */
export const logActivity = async (log: ActivityLog) => {
  try {
    const { error } = await (supabase
      .from('activity_logs') as any)
      .insert([log]);
    
    if (error) console.error('Error logging activity:', error);
  } catch (err) {
    console.error('Logging failed:', err);
  }
};

/**
 * Common Permission Checks
 */
export const canPerformAction = (role: string | null, permission: 'full' | 'support' | 'billing' | 'super'): boolean => {
  if (!role) return false;
  if (role === 'super_admin') return true;
  
  switch (permission) {
    case 'super':
      return role === 'super_admin';
    case 'support':
      return role === 'support_admin' || role === 'super_admin';
    case 'billing':
      return role === 'billing_admin' || role === 'super_admin';
    case 'full':
      return role === 'super_admin';
    default:
      return false;
  }
};
