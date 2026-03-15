import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Petition } from '../../../types/Petition';
import { StepsComponent } from '../../../components/steps/steps.component';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { PetitionService } from '../../../services/petition.service';
import { NavigationService } from '../../../services/navigarion.service';
import { ModernNotificationService } from '../../../components/notification/notification.service';
import { AuthService } from '../../../services/auth.service';
import { PETITION_STATUS_LABELS, getPetitionStatusLabel } from '../../../utils/status';

@Component({
  selector: 'app-petition-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StepsComponent, ProgressBarComponent],
  templateUrl: './petition-detail-page.component.html',
  styleUrl: './petition-detail-page.component.scss'
})
export class PetitionDetailPage implements OnInit {
  petition = signal<Petition | undefined>(undefined);
  steps = [
    PETITION_STATUS_LABELS[0],
    PETITION_STATUS_LABELS[1],
    PETITION_STATUS_LABELS[2],
    PETITION_STATUS_LABELS[3],
  ];
  // -1: Cancelado/Arquivado, 0: Em Coleta, 1: Meta Atingida, 2: Protocolado, 3: Finalizado
  statusMap: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    [-1]: 0
  };

  constructor(
    private route: ActivatedRoute,
    private petitionService: PetitionService,
    private navigationService: NavigationService,
    private notificationService: ModernNotificationService,
    private authService: AuthService
  ) { }

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
    return this.statusMap[Number(this.petition()?.status ?? 0)];
  }

  getStatusLabel(status: number): string {
    return getPetitionStatusLabel(status);
  }

  getProgressPercentage(): number {
    if (!this.petition) return 0;
    return Math.min(((this.petition()?.signaturesCount || 0) / (this.petition()?.goal || 0)) * 100, 100);
  }

  goback() {
    this.navigationService.back();
  }

  support() {
    const id = this.petition()?.id
    if (id) {
      this.petitionService.signPetition(id).subscribe({
        next: (value) => {
          this.petitionService.getPetition(value!.data.id).subscribe({
            next: (pet) => {
              this.petition.set(pet)
              this.notificationService.toast.success('Assinatura realizada com sucesso')
            }
          })
        }
      })
    }
  }

  unsupport() {
    const id = this.petition()?.id
    if (id) {
      this.petitionService.unsignPetition(id).subscribe({
        next: (value) => {
          this.petitionService.getPetition(value!.data.id).subscribe({
            next: (pet) => {
              this.petition.set(pet)
            }
          })
        }
      })
    }
  }

  get userIsOwner() {
    return this.petition()?.createdBy === this.authService.getUserFromStorage()?.id
  }

  get userLogged() {
    return this.authService.userLogged()
  }
}
