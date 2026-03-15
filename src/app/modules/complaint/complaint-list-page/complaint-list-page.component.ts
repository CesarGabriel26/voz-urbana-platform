import { Component, ViewChild, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { Card } from '../../../components/card/card';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { ComplaintService } from '../../../services/complaint.service';
import { startWith } from 'rxjs';
import { Complaint } from '../../../types/Complaint';
import { getPriorityColor } from '../../../utils/priority';

@Component({
  selector: 'app-complaint-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MapComponent, Card, FormInputComponent, DatePipe],
  templateUrl: './complaint-list-page.component.html',
  styleUrl: './complaint-list-page.component.scss'
})
export class ComplaintListPage implements OnInit {
  getPriorityColor = getPriorityColor;
  @ViewChild(MapComponent) map!: MapComponent;

  private complaintService = inject(ComplaintService);
  private route = inject(ActivatedRoute);

  searchControl = new FormControl('');
  // Convert search value changes to a signal
  searchValue = toSignal(this.searchControl.valueChanges.pipe(startWith('')), { initialValue: '' });
  
  isMyComplaints = signal(false);
  complaints = signal<Complaint[]>([]);
  isLoading = signal(true);

  filteredComplaints = computed(() => {
    const search = this.searchValue()?.toLowerCase() || '';
    const allComplaints = this.complaints();
    
    if (!search) return allComplaints;
    
    return allComplaints.filter(c =>
      c.title.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.category.toLowerCase().includes(search)
    );
  });

  mapPoints = computed<MapPoint[]>(() => {
    return this.filteredComplaints().map(c => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      title: c.title,
      color: getPriorityColor(c.priority),
      popupContent: `
        <div style="font-family: 'Raleway', sans-serif;">
          <span style="color: var(--blue-10); font-size: 1.1rem; line-clamp: 1; word-break: break-all; -webkit-box-orient: vertical; -webkit-line-clamp: 1;">${c.title}</strong>
          <p style="margin: 8px 0; font-size: 0.9rem; color: var(--gray-11); word-break: break-all">${c.description.substring(0, 100)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--gray-5); padding-top: 8px;">
            <span style="font-size: 0.8rem; font-weight: 600; color: ${getPriorityColor(c.priority)};">${c.category_name}</span>
            <span style="font-size: 0.8rem; color: var(--gray-9);">${new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      `
    }));
  });

  ngOnInit() {
    this.isMyComplaints.set(this.route.snapshot.data['isMyComplaints'] || false);
    this.loadComplaints();
  }

  loadComplaints() {
    this.isLoading.set(true);
    const obs = this.isMyComplaints()
      ? this.complaintService.getMyComplaints()
      : this.complaintService.getComplaints();

    obs.subscribe(data => {
      this.complaints.set(data);
      this.isLoading.set(false);
    });
  }

  onCardClick(item: any) {
    this.map?.focusOn(item.lat, item.lng, 17);
  }

  onMapPointClick(point: MapPoint) {
    const element = document.getElementById(`complaint-${point.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
