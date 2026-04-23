export type PushNotificationRegistration =
  | {
      status: 'registered';
      token: string;
      deviceName: string;
    }
  | { status: 'denied' | 'unavailable' | 'error' };

export interface PushNotificationProvider {
  register(): Promise<PushNotificationRegistration>;
}
