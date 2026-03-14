import { Component, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ComplaintService } from '../../../services/complaint.service';
import { Complaint } from '../../../types/Complaint';
import { DataTableComponent, TableColumn } from '../../../components/data-table/data-table.component';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, DataTableComponent, FormInputComponent],
  templateUrl: './complaints.html',
  styleUrl: './complaints.scss',
})
export class ComplaintsPage implements OnInit {
  complaints = signal<Complaint[]>([]);
  searchControl = new FormControl('');
  
  columns: TableColumn<Complaint>[] = [
    { key: 'title', label: 'Título' },
    { key: 'status', label: 'Status' },
    { key: 'category_name', label: 'Categoria' },
    { key: 'createdAt', label: 'Data' },
  ];

  filterFields = ['title', 'description', 'category_name', 'status'] as (keyof Complaint)[];

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.loadComplaints();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        // O DataTableComponent já lida com o filtro interno se passarmos a query
      });
  }

  loadComplaints(): void {
    this.complaintService.getComplaints().subscribe((data) => {
      this.complaints.set(data);
    });
  }

  updateStatus(id: string, status: string): void {
    this.complaintService.updateComplaintStatus(id, status).subscribe(() => {
      this.loadComplaints();
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      'in-progress': 'Em Andamento',
      resolved: 'Resolvida',
      rejected: 'Rejeitada',
      accepted: 'Aceita'
    };
    return labels[status] || status;
  }
}
