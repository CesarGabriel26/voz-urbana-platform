import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Complaint } from '../types/Complaint';
import { config } from '../config';
import { AuthService } from './auth.service';
import { HttpResponse } from '../types/HttpResponse';
import { ConnectivityService } from './connectivity.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);

  constructor(
    private authService: AuthService,
    private connectivityService: ConnectivityService,
    private storageService: StorageService
  ) { }

  getHeaders() {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenFromStorage()}`
    })
    return headers
  }

  getComplaints(filter?: { status?: string, category?: string, createdBy?: string }): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${config.api}/complaints`, { params: filter })
  }

  getMyComplaints(): Observable<Complaint[]> {
    const headers = this.getHeaders()
    return this.http.get<Complaint[]>(`${config.api}/complaints/my`, { headers })
  }

  getComplaint(id: string): Observable<Complaint | undefined> {
    const headers = this.getHeaders()
    return this.http.get<Complaint>(`${config.api}/complaints/complaint/${id}`, { headers })
  }

  createComplaint(complaint: Partial<Complaint>, photoBlob?: Blob): Observable<Complaint | { queued: boolean }> {
    if (!this.connectivityService.isOnline) {
      // Offline: queue it
      return new Observable(subscriber => {
        this.storageService.queueComplaint(complaint, photoBlob)
          .then(() => {
            subscriber.next({ queued: true } as any);
            subscriber.complete();
          })
          .catch(err => subscriber.error(err));
      });
    }

    const headers = this.getHeaders();
    return this.http.post<Complaint>(`${config.api}/complaints`, complaint, { headers });
  }

  voteComplaint(id: string): Observable<HttpResponse<Complaint>> {
    const headers = this.getHeaders()
    return this.http.post<HttpResponse<Complaint>>(`${config.api}/complaints/${id}/vote`, {}, { headers })
  }

  updateComplaintStatus(id: string, status: number): Observable<Complaint> {
    const headers = this.getHeaders()
    return this.http.put<Complaint>(`${config.api}/complaints/${id}`, { status }, { headers });
  }
}
