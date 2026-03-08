import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { Petition } from '../types/Petition';
import { config } from '../config';
import { AuthService } from './auth.service';
import { HttpResponse } from '../types/HttpResponse';

@Injectable({
  providedIn: 'root'
})
export class PetitionService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  handleError(error: any) {
    console.error(error)
    return of(null)
  }

  getHeaders() {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenFromStorage()}`
    })
    return headers
  }

  getPetitions(): Observable<Petition[]> {
    return this.http.get<Petition[]>(`${config.api}/petitions`)
  }

  getMyPetitions(): Observable<Petition[]> {
    const headers = this.getHeaders()
    return this.http.get<Petition[]>(`${config.api}/petitions/my`, { headers })
  }

  getPetition(id: string): Observable<Petition | undefined> {
    return this.http.get<Petition>(`${config.api}/petitions/petition/${id}`)
  }

  calculateMinimumGoal(scope: string, totalVoters: number): number {
    switch (scope) {
      case 'city_law':
        return Math.ceil(totalVoters * 0.05); // 5% legal (CF/88)
      case 'city_pressure':
        return Math.ceil(totalVoters * 0.01); // 1% recommended for pressure
      case 'neighborhood':
        return 100; // Fixed minimum for neighborhood
      default:
        return 10;
    }
  }

  createPetition(petition: Partial<Petition>): Observable<Petition> {
    const headers = this.getHeaders()

    return this.http.post<Petition>(`${config.api}/petitions`, petition, { headers })
  }

  signPetition(id: string): Observable<HttpResponse<Petition>> {
    const headers = this.getHeaders()

    const body = {
      fullName: this.authService.getUserFromStorage()?.name,
      cpfHash: this.authService.getUserFromStorage()?.cpfHash,
    }

    return this.http.post<HttpResponse<Petition>>(`${config.api}/petitions/${id}/sign`, body, { headers })
  }

  unsignPetition(id: string): Observable<HttpResponse<Petition>> {
    const headers = this.getHeaders()
    return this.http.post<HttpResponse<Petition>>(`${config.api}/petitions/${id}/unsign`, {}, { headers })
  }
}
