import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats } from '../../../../services/stats.service';
import { LucideAngularModule, Activity, TrendingUp, AlertTriangle, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class DashboardOverview implements OnInit {
  private statsService = inject(StatsService);
  stats = signal<DashboardStats | null>(null);

  readonly icons = {
    Activity, Trend: TrendingUp, Warning: AlertTriangle, Alert: AlertCircle, 
    Check: CheckCircle2, Clock, Users
  };

  ngOnInit(): void {
    this.statsService.getDashboardStats().subscribe(data => this.stats.set(data));
  }
}
