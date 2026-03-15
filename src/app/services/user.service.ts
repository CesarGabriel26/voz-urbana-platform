import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, SignupRequest } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${config.api}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenFromStorage()}`
    });
  }

  updateNotificationSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/notification-settings`, JSON.stringify(settings), {
      headers: this.getHeaders()
    });
  }

  create(data: SignupRequest): Observable<User> {
    // Logic to create user
    // return this.http.post<User>(`${this.apiUrl}`, data);

    // Mock for now as requested
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      name: data.name,
      email: data.email,
      phoneNumber: data.phone,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return of(mockUser);
  }

  update(id: string, data: Partial<User>): Observable<User> {
    // Logic to update user
    // return this.http.patch<User>(`${this.apiUrl}/${id}`, data);

    // Mock for now
    const mockUser: User = {
      id,
      name: data.name || 'Mock User',
      email: data.email || 'mock@example.com',
      phoneNumber: data.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    return of(mockUser);
  }
}
