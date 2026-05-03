import type { UserDeviceRepository } from '@/domain/repositories/UserDeviceRepository';

import { saveUserDevice } from '../dao/userDevice';

export const userDeviceRepository: UserDeviceRepository = {
  async saveUserDevice({ userId, pushToken, deviceName }) {
    await saveUserDevice(userId, pushToken, deviceName);
  },
};
