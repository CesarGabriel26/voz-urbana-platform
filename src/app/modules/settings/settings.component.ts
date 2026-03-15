import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PushNotificationService } from '../../services/push-notification.service';
import { SwPush } from '@angular/service-worker';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
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
    private userService: UserService,
    public pushService: PushNotificationService,
    private swPush: SwPush
  ) { }

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
    this.userService.updateNotificationSettings(this.settings).subscribe({
      next: () => {
        const user = this.authService.getUser();
        if (user) {
          user.notificationSettings = this.settings;
        }
      },
      error: (err) => console.error('Error saving settings', err)
    });
  }
}
