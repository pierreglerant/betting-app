import { registerPushNotificationsUseCase } from '@/domain/usecases/registerPushNotifications';
import type {
  PushNotificationProvider,
  PushNotificationRegistration,
} from '@/domain/repositories/PushNotificationProvider';
import type { UserDeviceRepository } from '@/domain/repositories/UserDeviceRepository';

describe('registerPushNotificationsUseCase', () => {
  function makePushNotificationProviderMock() {
    return {
      register: jest.fn(),
    } as unknown as jest.Mocked<PushNotificationProvider>;
  }

  function makeUserDeviceRepositoryMock() {
    return {
      saveUserDevice: jest.fn(),
    } as unknown as jest.Mocked<UserDeviceRepository>;
  }

  it('saves the device when registration is successful', async () => {
    const notificationProvider = makePushNotificationProviderMock();
    const userDeviceRepository = makeUserDeviceRepositoryMock();
    const registration: PushNotificationRegistration = {
      status: 'registered',
      token: 'push-token',
      deviceName: 'iPhone',
    };

    notificationProvider.register.mockResolvedValue(registration);
    userDeviceRepository.saveUserDevice.mockResolvedValue(undefined);

    const result = await registerPushNotificationsUseCase(
      notificationProvider,
      userDeviceRepository,
      'user-1',
    );

    expect(notificationProvider.register).toHaveBeenCalledTimes(1);
    expect(userDeviceRepository.saveUserDevice).toHaveBeenCalledTimes(1);
    expect(userDeviceRepository.saveUserDevice).toHaveBeenCalledWith({
      userId: 'user-1',
      pushToken: 'push-token',
      deviceName: 'iPhone',
    });
    expect(result).toEqual(registration);
  });

  it('does not save the device when registration is denied', async () => {
    const notificationProvider = makePushNotificationProviderMock();
    const userDeviceRepository = makeUserDeviceRepositoryMock();
    const registration: PushNotificationRegistration = { status: 'denied' };

    notificationProvider.register.mockResolvedValue(registration);

    const result = await registerPushNotificationsUseCase(
      notificationProvider,
      userDeviceRepository,
      'user-1',
    );

    expect(notificationProvider.register).toHaveBeenCalledTimes(1);
    expect(userDeviceRepository.saveUserDevice).not.toHaveBeenCalled();
    expect(result).toEqual(registration);
  });

  it('propagates provider errors', async () => {
    const notificationProvider = makePushNotificationProviderMock();
    const userDeviceRepository = makeUserDeviceRepositoryMock();

    notificationProvider.register.mockRejectedValue(new Error('Provider error'));

    await expect(
      registerPushNotificationsUseCase(notificationProvider, userDeviceRepository, 'user-1'),
    ).rejects.toThrow('Provider error');

    expect(notificationProvider.register).toHaveBeenCalledTimes(1);
    expect(userDeviceRepository.saveUserDevice).not.toHaveBeenCalled();
  });
});
