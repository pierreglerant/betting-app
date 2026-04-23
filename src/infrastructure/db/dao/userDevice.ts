import { supabase } from '@/infrastructure/db/api/supabase';

export async function saveUserDevice(userId: string, pushToken: string, deviceName: string) {
  console.log('[notifications] save user_device:start', { userId, deviceName });

  const { error } = await supabase.from('user_device').upsert(
    {
      user_id: userId,
      push_token: pushToken,
      device_name: deviceName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'push_token' },
  );

  if (error) {
    throw error;
  }

  console.log('[notifications] save user_device:upserted');
}
