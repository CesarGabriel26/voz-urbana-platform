import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Petition } from '../../../types/Petition';
import { StepsComponent } from '../../../components/steps/steps.component';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { PetitionService } from '../../../services/petition.service';

@Component({
  selector: 'app-petition-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StepsComponent, ProgressBarComponent],
  templateUrl: './petition-detail-page.component.html',
  styleUrl: './petition-detail-page.component.scss'
})
export class PetitionDetailPage implements OnInit {
  petition = signal<Petition | undefined>(undefined);
  steps = ['Em Coleta', 'Meta Atingida', 'Protocolado', 'Finalizado'];
  statusMap: Record<string, number> = {
    'active': 0,
    'completed': 3,
    'archived': 3
  };

  constructor(
    private route: ActivatedRoute,
    private petitionService: PetitionService    
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.petitionService.getPetition(id).subscribe({
        next: (value) => {
          this.petition.set(value)
        }
      })
    }
  }

  getCurrentStep(): number {
    // If signatures >= goal, we could move to step 1
    if (this.petition() && (this.petition()?.signaturesCount || 0) >= (this.petition()?.goal || 0)) {
       return 1;
    }
    return this.statusMap[this.petition()?.status || 'active'];
  }

  getProgressPercentage(): number {
    if (!this.petition) return 0;
    return Math.min(((this.petition()?.signaturesCount || 0) / (this.petition()?.goal || 0)) * 100, 100);
  }
}
