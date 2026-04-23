export interface SaveUserDeviceParams {
  userId: string;
  pushToken: string;
  deviceName: string;
}

export interface UserDeviceRepository {
  saveUserDevice(params: SaveUserDeviceParams): Promise<void>;
}
