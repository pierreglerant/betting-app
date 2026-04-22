import { supabase } from '@/infrastructure/db/api/supabase';

export async function saveUserDevice(userId: string, pushToken: string, deviceName: string) {
  console.log('[notifications] save user_device:start', { userId, deviceName });

  const { data: existingDevice, error: findError } = await supabase
    .from('user_device')
    .select('id')
    .eq('push_token', pushToken)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existingDevice?.id) {
    const { error } = await supabase
      .from('user_device')
      .update({
        user_id: userId,
        device_name: deviceName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDevice.id);

    if (error) {
      throw error;
    }

    console.log('[notifications] save user_device:updated');
    return;
  }

  const { error } = await supabase.from('user_device').insert({
    user_id: userId,
    push_token: pushToken,
    device_name: deviceName,
  });

  if (error) {
    throw error;
  }

  console.log('[notifications] save user_device:inserted');
}
