import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { config } from '../config';
import { AuthService } from './auth.service';

export interface DashboardStats {
  indicators: {
    openComplaints: number;
    resolvedComplaints: number;
    activePetitions: number;
    resolutionRate: number;
    avgResolutionTime: number;
    totalConfirmations: number;
  };
  healthScore: number;
  distributions: {
    categories: { name: string, value: number }[];
    neighborhoods: { name: string, value: number }[];
  };
  evolution: { name: string, series: { name: string, value: number }[] }[];
  topProblems: { id: string, title: string, votes: number }[];
  participation: {
    activeUsers: number;
    engagements: number;
    avgEngagementsPerUser: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${config.api}/stats`;

  stats = signal<DashboardStats | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getHeaders() {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenFromStorage()}`
    })
    return headers
  }


  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`, {
      headers: this.getHeaders()
    }).pipe(
      tap(data => this.stats.set(data))
    );
  }
}
