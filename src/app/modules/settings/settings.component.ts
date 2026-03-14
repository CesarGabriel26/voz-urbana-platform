import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { config } from '../../config';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <header>
        <h1>Configurações</h1>
        <p>Gerencie suas notificações e preferências</p>
      </header>

      <section class="settings-section">
        <h2>Notificações</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="material-symbols-outlined">notifications</span>
            <div>
              <h3>Push Notifications</h3>
              <p>Receber alertas no navegador</p>
            </div>
          </div>
          <button class="btn" [class.btn-primary]="!pushService.isSubscribed()" [class.btn-outline]="pushService.isSubscribed()" (click)="togglePush()">
            {{ pushService.isSubscribed() ? 'Desativar' : 'Ativar' }}
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="material-symbols-outlined">volume_up</span>
            <div>
              <h3>Notificação Sonora</h3>
              <p>Tocar um som ao receber notificações</p>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="settings.soundEnabled" (change)="saveSettings()">
            <span class="slider round"></span>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h2>Assuntos de interesse</h2>
        <p class="section-desc">Escolha sobre o que você deseja ser notificado:</p>

        <div class="subject-grid">
          <div class="subject-card">
            <h3>Abaixo-assinados</h3>
            <div class="subject-item">
              <span>Petição aceita</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.petitionAccepted" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="subject-item">
              <span>Voto em petição</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.petitionVoted" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="subject-item">
              <span>Status de petição</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.petitionStatusChanged" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div class="subject-card">
            <h3>Reclamações</h3>
            <div class="subject-item">
              <span>Reclamação aceita</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.complaintAccepted" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="subject-item">
              <span>Voto em reclamação</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.complaintVoted" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="subject-item">
              <span>Status de reclamação</span>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="settings.subjects.complaintStatusChanged" (change)="saveSettings()">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    header {
      margin-bottom: 2rem;
      h1 { font-size: 2rem; margin-bottom: 0.5rem; }
      p { opacity: 0.7; }
    }
    .settings-section {
      background: var(--card-bg, #fff);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      h2 { font-size: 1.25rem; margin-bottom: 1.5rem; }
    }
    .section-desc { margin-bottom: 1.5rem; opacity: 0.8; }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      &:last-child { border-bottom: none; }
    }
    .setting-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      span { font-size: 2rem; color: var(--primary-color); }
      h3 { font-size: 1rem; margin: 0; }
      p { font-size: 0.875rem; opacity: 0.7; margin: 0; }
    }
    .subject-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .subject-card {
      background: rgba(0,0,0,0.02);
      padding: 1rem;
      border-radius: 8px;
      h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; opacity: 0.6; }
    }
    .subject-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }
    
    /* Toggle Switch */
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
    input:checked + .slider { background-color: var(--primary-color, #2196F3); }
    input:focus + .slider { box-shadow: 0 0 1px var(--primary-color, #2196F3); }
    input:checked + .slider:before { transform: translateX(20px); }
    .slider.round { border-radius: 24px; }
    .slider.round:before { border-radius: 50%; }

    @media (max-width: 600px) {
      .subject-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings = {
    soundEnabled: true,
    subjects: {
      petitionAccepted: true,
      petitionVoted: true,
      petitionStatusChanged: true,
      complaintVoted: true,
      complaintAccepted: true,
      complaintStatusChanged: true
    }
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    public pushService: PushNotificationService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const user = this.authService.getUser();
    if (user?.notificationSettings) {
      this.settings = user.notificationSettings;
    }
  }

  async togglePush() {
    if (this.pushService.isSubscribed()) {
      await this.pushService.unsubscribeFromNotifications();
    } else {
      const permission = await this.pushService.requestPermission();
      if (permission === 'granted') {
        await this.pushService.subscribeToNotifications();
      }
    }
  }

  saveSettings() {
    this.http.put(`${config.api}/users/notification-settings`, this.settings).subscribe({
      next: () => {
        // Update local user data if possible
        const user = this.authService.getUser();
        if (user) {
          user.notificationSettings = this.settings;
          // You might need a way to pulse this update to other components
        }
      },
      error: (err) => console.error('Error saving settings', err)
    });
  }
}
