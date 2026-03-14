import { Injectable, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { config } from '../config';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = 'BJoJIWa3BxxjTxe7fY57dEeWWDzH3629mzpaKOoFWboj2JT8F762J9Vq5jRPEGUzY_0o884I_ZCsRfyVwT4PzO8';

  isSubscribed = signal(false);

  constructor(
    private swPush: SwPush,
    private http: HttpClient
  ) {
    this.swPush.subscription.subscribe(sub => {
      this.isSubscribed.set(!!sub);
    });
  }

  async subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.warn('Service Worker not enabled');
      return false;
    }

    try {
      console.log('chamado');

      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      console.log('subscription', sub);
      await firstValueFrom(this.http.post(`${config.api}/users/push/subscribe`, sub));
      this.isSubscribed.set(true);
      this.notifyEnabled();
      return true;

    } catch (err) {
      console.error('Could not subscribe to notifications', err);
      return false;
    }
  }

  notifyEnabled() {
    if (Notification.permission !== 'granted') return;

    new Notification('🔔 Voz Urbana', {
      body: 'Agora você receberá atualizações sobre suas reclamações.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png'
    });
  }


  async unsubscribeFromNotifications() {
    try {
      const sub = await firstValueFrom(this.swPush.subscription);
      if (sub) {
        await firstValueFrom(this.http.post(`${config.api}/users/push/unsubscribe`, { endpoint: sub.endpoint }));
        await sub.unsubscribe();
      }
      this.isSubscribed.set(false);
      return true;
    } catch (err) {
      console.error('Could not unsubscribe from notifications', err);
      return false;
    }
  }

  requestPermission() {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }
}
