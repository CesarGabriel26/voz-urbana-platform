import { Injectable, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { config } from '../config';

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
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      console.log(sub);

      // await this.http.post(`${config.api}/users/push/subscribe`, sub).toPromise();
      this.isSubscribed.set(true);
      return true;
    } catch (err) {
      console.error('Could not subscribe to notifications', err);
      return false;
    }
  }


  async unsubscribeFromNotifications() {
    try {
      const sub = await this.swPush.subscription.toPromise();
      if (sub) {
        // await this.http.post(`${config.api}/users/push/unsubscribe`, { endpoint: sub.endpoint }).toPromise();
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
