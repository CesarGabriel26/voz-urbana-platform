import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Petition } from '../../../types/Petition';
import { StepsComponent } from '../../../components/steps/steps.component';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-petition-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StepsComponent, ProgressBarComponent],
  templateUrl: './petition-detail-page.component.html',
  styleUrl: './petition-detail-page.component.scss'
})
export class PetitionDetailPage implements OnInit {
  petition?: Petition;
  steps = ['Em Coleta', 'Meta Atingida', 'Protocolado', 'Finalizado'];
  statusMap: Record<string, number> = {
    'active': 0,
    'completed': 3,
    'archived': 3
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Mocking petition data
      this.petition = {
        id,
        title: 'Melhoria na Iluminação do Parque Municipal',
        description: 'Solicitamos a instalação de novos postes de iluminação LED e a manutenção dos existentes em todo o perímetro do Parque Municipal. Atualmente, muitas áreas ficam às escuras após as 18h, o que desestimula a prática de esportes e compromete a segurança dos frequentadores.',
        category: 'Infraestrutura e Transporte',
        goal: 1500,
        signaturesCount: 780,
        scope: 'city',
        visibility: 'public',
        status: 'active',
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'Av. das Flores, s/n - Jardim das Artes',
          neighborhood: 'Jardim das Artes'
        },
        createdBy: 'user456',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
        updatedAt: new Date(),
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 60))
      };
    }
  }

  getCurrentStep(): number {
    // If signatures >= goal, we could move to step 1
    if (this.petition && this.petition.signaturesCount >= this.petition.goal) {
       return 1;
    }
    return this.statusMap[this.petition?.status || 'active'];
  }

  getProgressPercentage(): number {
    if (!this.petition) return 0;
    return Math.min((this.petition.signaturesCount / this.petition.goal) * 100, 100);
  }
}
