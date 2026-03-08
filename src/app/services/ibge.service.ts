import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, delay } from 'rxjs';

export interface IbgeState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IbgeCity {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class IbgeService {
  private http = inject(HttpClient);
  private baseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

  getStates(): Observable<IbgeState[]> {
    return this.http.get<IbgeState[]>(`${this.baseUrl}/estados?orderBy=nome`);
  }

  getCities(stateId: number | string): Observable<IbgeCity[]> {
    return this.http.get<IbgeCity[]>(`${this.baseUrl}/estados/${stateId}/municipios?orderBy=nome`);
  }

  /**
   * Mock function to simulate fetching voter count by IBGE code.
   * In a real scenario, this would call a backend or search a local JSON.
   */
  getVoterCount(cityIbgeCode: string | number): Observable<number> {
    const codeStr = cityIbgeCode.toString();
    const hash = codeStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseVoters = 10000 + (hash * 150) % 500000;
    return of(baseVoters || 0);
  }

  getNeighborhoods(cityId: number | string): Observable<string[]> {
    // Mock neighborhoods for the given city
    return of([
      'Centro',
      'Jardim Planalto',
      'Vila Maria',
      'Bairro Industrial',
      'Parque das Nações',
      'Santa Rita'
    ]).pipe(delay(300));
  }
}
