import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Complaint } from '../../../types/Complaint';
import { StepsComponent } from '../../../components/steps/steps.component';
import { PrioritiesColors } from '../../../utils/consts';
import { ComplaintService } from '../../../services/complaint.service';

@Component({
  selector: 'app-complaint-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StepsComponent],
  templateUrl: './complaint-detail-page.component.html',
  styleUrl: './complaint-detail-page.component.scss'
})
export class ComplaintDetailPage implements OnInit {
  complaint = signal<Complaint | undefined>(undefined);
  steps = ['Pendente', 'Em Progresso', 'Resolvido', 'Rejeitado'];
  statusMap: Record<string, number> = {
    'pending': 0,
    'in-progress': 1,
    'resolved': 2,
    'rejected': 3
  };

  constructor(
    private route: ActivatedRoute,
    private complaintService: ComplaintService
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
    return this.statusMap[this.complaint()?.status || 'pending'];
  }

  getPriorityColor(): string {
    return PrioritiesColors[this.complaint()?.priority || 0];
  }
}
