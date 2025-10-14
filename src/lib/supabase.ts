import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AttendanceStatus = 'definitely' | 'maybe' | 'cannot';
export type Side = 'bride' | 'groom';

export interface RSVP {
  id: string;
  guest_name: string;
  side: Side;
  attendance_status: AttendanceStatus;
  phone?: string;
  message?: string;
  created_at: string;
}
