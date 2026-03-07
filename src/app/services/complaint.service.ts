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
  private mockComplaints: Complaint[] = Array(100).fill(null).map((_, i) => ({
    id: String(i + 1),
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
    status: 'pending',
    priority: Math.floor(Math.random() * 11),
    visibility: 'public',
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as Complaint));

  getComplaints(): Observable<Complaint[]> {
    // Simulated API call
    return of(this.mockComplaints).pipe(delay(500));
  }

  getMyComplaints(): Observable<Complaint[]> {
    // Simulated API call filtering by user (mocked as the first 4 items)
    return of(this.mockComplaints.slice(0, 4)).pipe(delay(500));
  }

  getComplaint(id: string): Observable<Complaint | undefined> {
    return of(this.mockComplaints.find(c => c.id === id)).pipe(delay(500));
  }

  createComplaint(complaint: Partial<Complaint>): Observable<Complaint> {
    return this.http.post<Complaint>('/api/complaints', complaint);
  }
}
