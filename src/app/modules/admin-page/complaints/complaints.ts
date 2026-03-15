import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComplaintService } from '../../../services/complaint.service';
import { Complaint } from '../../../types/Complaint';
import { DataTableComponent, TableColumn } from '../../../components/data-table/data-table.component';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { getComplaintStatusLabel } from '../../../utils/status';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, DataTableComponent, FormInputComponent],
  templateUrl: './complaints.html',
  styleUrl: './complaints.scss',
})
export class ComplaintsPage implements OnInit {
  complaints = signal<Complaint[]>([]);

  filterForm = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(''),
    status: new FormControl(''),
    priority: new FormControl(''),
    neighborhood: new FormControl(''),
    date: new FormControl(''),
  });

  // Convert form changes to a signal so computed() can track it
  formValues = toSignal(this.filterForm.valueChanges, { initialValue: this.filterForm.value });

  categories = signal<string[]>([]);
  neighborhoods = signal<string[]>([]);

  get searchControl() {
    return this.filterForm.get('search') as FormControl;
  }

  filteredComplaints = computed(() => {
    let list = this.complaints();
    const filters = this.formValues();

    if (filters.search) {
      const search = filters.search.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }

    if (filters.category) {
      list = list.filter(c => c.category_name === filters.category);
    }

    if (filters.status !== '' && filters.status !== null && filters.status !== undefined) {
      list = list.filter(c => c.status === Number(filters.status));
    }

    if (filters.priority) {
      list = list.filter(c => {
        const info = this.getPriorityInfo(c);
        return info.class === filters.priority;
      });
    }

    if (filters.neighborhood) {
      list = list.filter(c => c.address?.includes(filters.neighborhood as string));
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      list = list.filter(c => new Date(c.createdAt).toDateString() === filterDate);
    }

    return list;
  });

  columns: TableColumn<Complaint>[] = [
    { key: 'title', label: 'Título' },
    { key: 'status', label: 'Status' },
    { key: 'category_name', label: 'Categoria' },
    { key: 'createdAt', label: 'Data' },
  ];

  filterFields = ['title', 'description', 'category_name', 'status'] as (keyof Complaint)[];

  private router = inject(Router);

  constructor(private complaintService: ComplaintService) { }

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.complaintService.getComplaints().subscribe((data) => {
      this.complaints.set(data);
      this.extractUniqueValues(data);
    });
  }

  extractUniqueValues(data: Complaint[]): void {
    const cats = [...new Set(data.map(c => c.category_name))].sort();
    this.categories.set(cats);

    // Extraction of neighborhood from address (simplistic approach: split by comma or just use common names)
    // For now, let's take unique address fragments that look like neighborhoods or just unique addresses if few.
    // Better: split and take the part that usually represents neighborhood in BR addresses.
    const neighs = [...new Set(data.map(c => {
      if (!c.address) return '';
      const parts = c.address.split(',');
      return parts.length > 1 ? parts[1].trim() : parts[0].trim();
    }))].filter(n => n !== '').sort();
    this.neighborhoods.set(neighs);
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      status: '',
      priority: '',
      neighborhood: '',
      date: '',
    });
  }

  updateStatus(id: string, status: number): void {
    this.complaintService.updateComplaintStatus(id, status).subscribe(() => {
      this.loadComplaints();
    });
  }

  getStatusLabel(status: number): string {
    return getComplaintStatusLabel(status);
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-pending';
      case 1:
        return 'status-approved';
      case 2:
        return 'status-in-review';
      case 3:
        return 'status-resolved';
      case -1:
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getPriorityInfo(complaint: Complaint): { label: string; class: string } {
    let priority = complaint.priority;

    // Infer priority if not defined (0 or undefined)
    if (!priority || priority === 0) {
      const highPriorityCategories = [
        'Maus-tratos a animais',
        'Risco elétrico',
        'Vazamento de gás',
        'Buraco perigoso',
        'Iluminação pública apagada',
      ];
      if (highPriorityCategories.includes(complaint.category_name)) {
        priority = 8; // High
      } else {
        priority = 4; // Medium
      }
    }

    if (priority >= 7) return { label: 'Alta Prioridade', class: 'priority-high' };
    if (priority >= 4) return { label: 'Média Prioridade', class: 'priority-medium' };
    return { label: 'Baixa Prioridade', class: 'priority-low' };
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const submissionDate = new Date(date);
    const diffInMs = now.getTime() - submissionDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `Há ${diffInMins} ${diffInMins === 1 ? 'minuto' : 'minutos'}`;
    }

    if (diffInHours < 24) {
      return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }

  openOnMap(complaint: Complaint): void {
    if (complaint.lat && complaint.lng) {
      const url = `https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`;
      window.open(url, '_blank');
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['/complaint', id]);
  }
}
