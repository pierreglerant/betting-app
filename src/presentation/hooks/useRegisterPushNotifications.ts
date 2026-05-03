import { registerPushNotificationsUseCase } from '@/domain/usecases/registerPushNotifications';
import { userDeviceRepository } from '@/infrastructure/db/repositories/userDevice';
import { expoPushNotificationProvider } from '@/infrastructure/notifications/registerPushNotifications';
import { useCallback } from 'react';

export function useRegisterPushNotifications() {
  const registerPushNotifications = useCallback(async (userId: string) => {
    return registerPushNotificationsUseCase(
      expoPushNotificationProvider,
      userDeviceRepository,
      userId,
    );
  }, []);

  return {
    registerPushNotifications,
  };
}
