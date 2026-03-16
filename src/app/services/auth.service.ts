import { Injectable, signal, computed, inject } from '@angular/core';
import { User, AuthResponse, LoginRequest } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { config } from '../config';
import { catchError, map, Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

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

  private storageService = inject(StorageService);

  constructor(
    private http: HttpClient
  ) {
    this.initAuth();
  }

  private async initAuth() {
    const data = await this.storageService.getAppState(this.STORAGE_KEY);
    if (data) {
      this._user.set(data.user);
      this._token.set(data.accessToken);
    }
  }

  getUser(): User | null {
    return this._user();
  }

  private handleHttpError<T>(fallback: T, operation: string, entityId?: string | number) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(
        `Erro ao ${operation} ${entityId ? `entidade ${entityId}` : 'entidade'}:`,
        error.message || error.statusText
      );
      return of(fallback);
    }
  }

  login(request: LoginRequest): Observable<AuthResponse | null> {
    const url = `${config.api}/users/login`;

    return this.http.post<AuthResponse>(url, request).pipe(
      map(res => {
        this.saveToStorage(res);
        return res;
      }),
      catchError(this.handleHttpError<AuthResponse | null>(null, 'login'))
    );
  }

  refreshToken(): Observable<AuthResponse | null> {
    const url = `${config.api}/users/refresh`;
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const refreshToken = data.refreshToken;

    if (!refreshToken) return of(null);

    return this.http.post<AuthResponse>(url, { refreshToken }).pipe(
      map(res => {
        this.saveToStorage(res);
        return res;
      }),
      catchError(err => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.storageService.setAppState(this.STORAGE_KEY, null);
    this._user.set(null);
    this._token.set(null);
  }

  saveToStorage(auth: AuthResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
    this.storageService.setAppState(this.STORAGE_KEY, auth);
    this._user.set(auth.user);
    this._token.set(auth.accessToken);
  }

  getUserFromStorage(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthResponse).user : null;
  }

  getTokenFromStorage(): string | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthResponse).accessToken : null;
  }

  getRefreshTokenFromStorage(): string | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthResponse).refreshToken : null;
  }

  userLogged(): boolean {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      return true
    } else {
      return false
    }
  }

  getPayload(): any | null {
    const token = this.getTokenFromStorage();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const payload = this.getPayload();
    return payload?.role ?? null;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
