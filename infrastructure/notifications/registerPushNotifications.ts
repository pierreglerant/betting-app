import type { PushNotificationProvider } from '@/domain/repositories/PushNotificationProvider';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const getProjectId = () =>
  Constants.easConfig?.projectId ??
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.expoConfig?.extra?.expoClient?.extra?.eas?.projectId;

const getDeviceName = () => Device.deviceName ?? Device.modelName ?? `${Platform.OS} device`;

export const expoPushNotificationProvider: PushNotificationProvider = {
  async register() {
    try {
      if (!Device.isDevice) {
        console.log('[notifications] unavailable: physical device required');
        return { status: 'unavailable' };
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const currentPermissions = await Notifications.getPermissionsAsync();
      const finalPermissions =
        currentPermissions.status === 'granted'
          ? currentPermissions
          : await Notifications.requestPermissionsAsync();

      if (finalPermissions.status !== 'granted') {
        console.log('[notifications] permission denied');
        return { status: 'denied' };
      }

      const projectId = getProjectId();
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const deviceName = getDeviceName();
      console.log('[notifications] expo push token received');

      return { status: 'registered', token, deviceName };
    } catch (error) {
      console.error('[notifications] registerPushNotifications:error', error);
      return { status: 'error' };
    }
  },
};
