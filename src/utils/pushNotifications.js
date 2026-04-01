import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabaseClient';
import { getVisitorId } from './fingerprint';

let initialized = false;

export async function initPushNotifications() {
  if (initialized) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Check current permission status
    const permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions();
      if (result.receive !== 'granted') {
        console.log('Push notifications permission denied');
        return;
      }
    } else if (permStatus.receive !== 'granted') {
      console.log('Push notifications not granted');
      return;
    }

    // Register for push notifications
    await PushNotifications.register();

    // On successful registration — save token
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Token:', token.value);
      await saveToken(token.value);
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // On notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received in foreground:', notification);
    });

    // On notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
      // Navigate based on notification data if needed
      const data = notification.notification.data;
      if (data?.url) {
        window.location.href = data.url;
      }
    });

    initialized = true;
  } catch (error) {
    console.error('Push notifications init error:', error);
  }
}

async function saveToken(fcmToken) {
  try {
    const visitorId = await getVisitorId();
    const platform = Capacitor.getPlatform(); // 'android' | 'ios'

    const { error } = await supabase.from('push_tokens').upsert({
      visitor_id: visitorId,
      token: fcmToken,
      platform: platform,
      updated_at: new Date().toISOString()
    }, { onConflict: 'visitor_id' });

    if (error) console.error('Error saving push token:', error);
  } catch (error) {
    console.error('Error in saveToken:', error);
  }
}
