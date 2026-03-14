import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats } from '../../../../services/stats.service';
import { LucideAngularModule, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-alerts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss'
})
export class DashboardAlerts implements OnInit {
  private statsService = inject(StatsService);
  stats = signal<DashboardStats | null>(null);

  readonly icon = AlertTriangle;

  ngOnInit(): void {
    this.statsService.getDashboardStats().subscribe(data => this.stats.set(data));
  }
}
