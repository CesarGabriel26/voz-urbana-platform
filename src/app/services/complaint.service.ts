import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Complaint } from '../types/Complaint';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);

  // Mock data for initial implementation
  private mockComplaints: any[] = Array(12).fill(null).map((_, i) => ({
    id: i + 1,
    lat: -20.89 + (Math.random() * 0.05 - 0.025),
    lng: -51.37 + (Math.random() * 0.05 - 0.025),
    title: [
      'Buraco na via principal',
      'Lixo acumulado na calçada',
      'Poste com lâmpada queimada',
      'Vandalismo em praça pública',
      'Falta de sinalização',
      'Árvore precisando de poda'
    ][i % 6] + ` #${i + 1}`,
    description: 'Relato de problema identificado pela comunidade que necessita de atenção urgente das autoridades competentes para garantir a segurança e bem-estar de todos.',
    color: ['#0A62AC', '#33FF99', '#FFD700', '#FF3300'][i % 4],
    date: '07/03/2026',
    category: ['Infraestrutura', 'Saneamento', 'Iluminação', 'Segurança'][i % 4],
    status: 'pending'
  }));

  getComplaints(): Observable<any[]> {
    // Simulated API call
    return of(this.mockComplaints).pipe(delay(500));
  }

  getMyComplaints(): Observable<any[]> {
    // Simulated API call filtering by user (mocked as the first 4 items)
    return of(this.mockComplaints.slice(0, 4)).pipe(delay(500));
  }

  createComplaint(complaint: Partial<Complaint>): Observable<any> {
    return this.http.post('/api/complaints', complaint);
  }
}
