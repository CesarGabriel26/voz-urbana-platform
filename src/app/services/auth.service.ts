import { Injectable, signal, computed } from '@angular/core';
import { User, AuthResponse, LoginRequest } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { config } from '../config';
import { catchError, map, Observable, of } from 'rxjs';

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

  constructor(
    private http: HttpClient
  ) { }

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
      catchError(this.handleHttpError<AuthResponse | null>(null, 'login'))
    );
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
    this._token.set(null);
  }

  saveToStorage(auth: AuthResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
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

  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
