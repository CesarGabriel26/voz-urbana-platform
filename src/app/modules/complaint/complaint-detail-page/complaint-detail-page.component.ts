import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Complaint } from '../../../types/Complaint';
import { StepsComponent } from '../../../components/steps/steps.component';
import { ComplaintService } from '../../../services/complaint.service';
import { AuthService } from '../../../services/auth.service';
import { getPriorityColor } from '../../../utils/priority';
import { COMPLAINT_STATUS_LABELS, getComplaintStatusLabel } from '../../../utils/status';

@Component({
  selector: 'app-complaint-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StepsComponent],
  templateUrl: './complaint-detail-page.component.html',
  styleUrl: './complaint-detail-page.component.scss'
})
export class ComplaintDetailPage implements OnInit {
  complaint = signal<Complaint | undefined>(undefined);
  steps = [
    COMPLAINT_STATUS_LABELS[0],
    COMPLAINT_STATUS_LABELS[1],
    COMPLAINT_STATUS_LABELS[2],
    COMPLAINT_STATUS_LABELS[3]
  ];
  // -1: Rejeitado/Arquivado, 0: Pendente, 1: Aceita, 2: Em progresso, 3: Resolvido
  statusMap: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    [-1]: 0
  };

  constructor(
    private route: ActivatedRoute,
    private complaintService: ComplaintService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.complaintService.getComplaint(id).subscribe(complaint => {
        this.complaint.set(complaint);
      });
    }
  }

  getCurrentStep(): number {
    return this.statusMap[Number(this.complaint()?.status ?? 0)];
  }

  getPriorityColor(): string {
    return getPriorityColor(this.complaint()?.priority || 0);
  }

  getStatusLabel(status: number): string {
    return getComplaintStatusLabel(status);
  }

  voteComplaint() {
    const id = this.complaint()?.id
    if (id) {
      this.complaintService.voteComplaint(id).subscribe({
        next: (value) => {
          this.complaintService.getComplaint(id).subscribe({
            next: (comp) => {
              this.complaint.set(comp)
            }
          })
        }
      })
    }
  }

  get userIsOwner() {
    return this.complaint()?.createdBy === this.authService.getUserFromStorage()?.id
  }

  get userLogged() {
    return this.authService.userLogged()
  }
}
