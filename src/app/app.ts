import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './components/notification/toast/container/toast.container';
import { ModernNotificationService } from './components/notification/notification.service';
import { SyncService } from './services/sync.service';
import { ConnectivityService } from './services/connectivity.service';
import { CommonModule } from '@angular/common';
import { inject, computed } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private syncService = inject(SyncService);
  connectivity = inject(ConnectivityService);
  
  protected readonly title = signal('voz-urbana-web');
  isOffline = computed(() => !this.connectivity.isOnlineSignal());
}
