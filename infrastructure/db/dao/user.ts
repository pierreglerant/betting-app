import { supabase } from '@/infrastructure/db/api/supabase';

export async function getUsers() {
  const { data, error } = await supabase.rpc('get_users');

  if (error) {
    throw error;
  }

  if (data == null) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase.rpc('get_user', { p_username: username });

  if (error) {
    throw error;
  }

  if (data == null) {
    throw new Error('User not found');
  }

  // RPC en SETOF renvoie souvent un tableau même pour une seule ligne.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    throw new Error('User not found');
  }

  return row;
}
