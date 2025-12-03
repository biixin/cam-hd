import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Message {
  id: string;
  content: string | null;
  type: 'text' | 'image' | 'audio';
  media_url: string | null;
  audio_duration: number | null;
  is_from_lead: boolean;
  read: boolean;
  created_at: string;
}

export interface FunnelStep {
  id: string;
  step_order: number;
  action_type: 'send_message' | 'wait_for_reply';
  message_content: string | null;
  message_type: 'text' | 'image' | 'audio' | null;
  media_url: string | null;
  typing_delay: number | null;
  active: boolean;
  created_at: string;
}

export interface FunnelState {
  id: string;
  current_step: number;
  waiting_for_reply: boolean;
  lead_id: string;
  updated_at: string;
}
