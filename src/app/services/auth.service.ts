import { Injectable, signal, computed } from '@angular/core';
import { User, AuthResponse, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = '@voz-ur-credentials';

  // State
  private _user = signal<User | null>(this.getUserFromStorage());
  private _token = signal<string | null>(this.getTokenFromStorage());

  // Public accessors
  user = this._user.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  constructor() { }

  login(request: LoginRequest): void {
    // In a real app, this would be an Observable call to an API
    // For now, we mock the response
    const mockResponse: AuthResponse = {
      token: 'mock-token-' + Math.random().toString(36).substring(7),
      user: {
        id: '1',
        name: 'Usuário Demonstrativo',
        email: 'user@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.saveToStorage(mockResponse);
    this._user.set(mockResponse.user);
    this._token.set(mockResponse.token);
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
    this._token.set(null);
  }

  private saveToStorage(auth: AuthResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
  }

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthResponse).user : null;
  }

  private getTokenFromStorage(): string | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthResponse).token : null;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
