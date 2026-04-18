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

export async function getUserStatistics(userId: string) {
  const { data, error } = await supabase.rpc('get_user_statistics', { p_user_id: userId });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : null;
}

export async function getUserPoints(userId: string) {
  const { data, error } = await supabase.from('user').select('points').eq('id', userId).single();

  if (error) {
    throw error;
  }

  return Number(data?.points ?? 0) || 0;
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

export async function getRanking() {
  const { data, error } = await supabase.rpc('get_ranking');

  if (error) {
    throw error;
  }

  return data || [];
}
