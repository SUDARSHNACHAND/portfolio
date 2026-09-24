import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Pre-configured with your Supabase Project URL (safely stripping any trailing /rest/v1/):
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://qkcdqrallaftegmwtyfc.supabase.co').trim();
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface ContactInquiry {
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

/**
 * Saves a new contact form message directly to Supabase
 */
export async function saveInquiryToSupabase(inquiry: ContactInquiry): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured with VITE_SUPABASE_ANON_KEY' };
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .insert([
        {
          name: inquiry.name,
          email: inquiry.email,
          message: inquiry.message,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save to Supabase';
    console.error('Supabase save inquiry error:', err);
    return { success: false, error: msg };
  }
}

/**
 * Fetches all contact messages from Supabase (for Admin Dashboard)
 */
export async function getInquiriesFromSupabase(): Promise<ContactInquiry[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch inquiries from Supabase:', err);
    return [];
  }
}

/**
 * Syncs CMS portfolio content to Supabase
 */
export async function saveContentToSupabase(key: string, contentData: Record<string, unknown>): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('portfolio_content')
      .upsert({
        id: key,
        data: contentData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to sync content to Supabase:', err);
    return false;
  }
}

/**
 * Loads CMS portfolio content from Supabase
 */
export async function loadContentFromSupabase(key: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('portfolio_content')
      .select('data')
      .eq('id', key)
      .single();

    if (error || !data) return null;
    return data.data as Record<string, unknown>;
  } catch (err) {
    console.error('Failed to load content from Supabase:', err);
    return null;
  }
}
