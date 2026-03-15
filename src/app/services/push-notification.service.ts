import { Injectable, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../config';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = config.VAPID_PUBLIC_KEY;

  isSubscribed = signal(false);

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.swPush.subscription.subscribe(sub => {
      this.isSubscribed.set(!!sub);
    });
  }

  getHeaders() {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenFromStorage()}`
    })
    return headers
  }

  async subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.warn('Service Worker not enabled');
      return false;
    }

    try {
      console.log('PushNotificationService: Iniciando subscrição...');

      const permission = await Notification.requestPermission();
      console.log('PushNotificationService: Permissão de notificação:', permission);

      if (permission !== 'granted') {
        console.warn('PushNotificationService: Permissão negada pelo usuário');
        return false;
      }

      console.log('PushNotificationService: Solicitando subscrição ao SwPush...');
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      console.log('PushNotificationService: Subscrição obtida:', sub);

      console.log('PushNotificationService: Enviando subscrição para o servidor...');
      await firstValueFrom(this.http.post(`${config.api}/users/push/subscribe`, sub, { headers: this.getHeaders() }));

      console.log('PushNotificationService: Subscrição salva com sucesso');
      this.isSubscribed.set(true);
      this.notifyEnabled();
      return true;

    } catch (err) {
      console.error('PushNotificationService: Erro durante a subscrição', err);
      return false;
    }
  }

  notifyEnabled() {
    if (Notification.permission !== 'granted') return;

    new Notification('Voz Urbana', {
      body: 'Agora você receberá atualizações sobre suas reclamações.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png'
    });
  }


  async unsubscribeFromNotifications() {
    try {
      const sub = await firstValueFrom(this.swPush.subscription);
      if (sub) {
        await firstValueFrom(this.http.post(`${config.api}/users/push/unsubscribe`, { endpoint: sub.endpoint }, { headers: this.getHeaders() }));
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
