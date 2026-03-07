import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Petition } from '../types/Petition';

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private http = inject(HttpClient);

  // Mock data for initial implementation
  private mockPetitions: Petition[] = Array(8).fill(null).map((_, i) => ({
    id: (i + 1).toString(),
    title: [
      'Revitalização do Parque Municipal',
      'Melhoria do Transporte Noturno',
      'Construção de ciclovia na Av. Central',
      'Aumento da segurança escolar',
      'Instalação de pontos de coleta seletiva'
    ][i % 5] + ` #${i + 1}`,
    description: 'Este abaixo-assinado visa coletar assinaturas para solicitar às autoridades locais uma intervenção imediata nesta área para o benefício de todos os cidadãos do bairro.',
    category: ['Meio Ambiente', 'Infraestrutura', 'Segurança', 'Cultura e Lazer'][i % 4],
    goal: 500 + (i * 100),
    signaturesCount: 150 + (i * 50),
    scope: ['neighborhood', 'city_pressure', 'city_law'][i % 3],
    visibility: 'public',
    status: 'active',
    location: {
      latitude: -20.89 + (Math.random() * 0.05 - 0.025),
      longitude: -51.37 + (Math.random() * 0.05 - 0.025),
      address: 'Rua Exemplo, 123',
      neighborhood: 'Centro'
    },
    createdBy: 'User' + i,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  getPetitions(): Observable<Petition[]> {
    return of(this.mockPetitions).pipe(delay(500));
  }

  getMyPetitions(): Observable<Petition[]> {
    return of(this.mockPetitions.slice(0, 3)).pipe(delay(500));
  }

  getPetition(id: string): Observable<Petition | undefined> {
    return of(this.mockPetitions.find(p => p.id === id)).pipe(delay(500));
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
    // In a real app, we would add the IP/UA here or on the backend
    return this.http.post<Petition>('/api/petitions', petition);
  }
}
