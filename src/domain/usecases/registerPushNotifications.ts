import type { PushNotificationProvider } from '../repositories/PushNotificationProvider';
import type { UserDeviceRepository } from '../repositories/UserDeviceRepository';

export async function registerPushNotificationsUseCase(
  notificationProvider: PushNotificationProvider,
  userDeviceRepository: UserDeviceRepository,
  userId: string,
) {
  const registration = await notificationProvider.register();

  if (registration.status !== 'registered') {
    return registration;
  }

  await userDeviceRepository.saveUserDevice({
    userId,
    pushToken: registration.token,
    deviceName: registration.deviceName,
  });

  return registration;
}
