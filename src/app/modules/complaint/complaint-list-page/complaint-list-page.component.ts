import { Component, ViewChild, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { Card } from '../../../components/card/card';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { ComplaintService } from '../../../services/complaint.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Complaint } from '../../../types/Complaint';
import { PrioritiesColors } from '../../../utils/consts';

@Component({
  selector: 'app-complaint-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MapComponent, Card, FormInputComponent, DatePipe],
  templateUrl: './complaint-list-page.component.html',
  styleUrl: './complaint-list-page.component.scss'
})
export class ComplaintListPage implements OnInit {
  PrioritiesColors = PrioritiesColors;

  @ViewChild(MapComponent) map!: MapComponent;

  private complaintService = inject(ComplaintService);
  private route = inject(ActivatedRoute);

  searchControl = new FormControl('');
  isMyComplaints = false;
  complaints = signal<Complaint[]>([]);
  isLoading = true;

  ngOnInit() {
    this.isMyComplaints = this.route.snapshot.data['isMyComplaints'] || false;
    this.loadComplaints();

    // Search focus logic
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && this.filteredComplaints.length > 0) {
        // Focus on the first result if there are any
        const first = this.filteredComplaints[0];
        this.map?.focusOn(first.lat, first.lng, 15);
      }
    });
  }

  loadComplaints() {
    this.isLoading = true;
    const obs = this.isMyComplaints
      ? this.complaintService.getMyComplaints()
      : this.complaintService.getComplaints();

    obs.subscribe(data => {
      this.complaints.set(data);
      this.isLoading = false;
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

  get filteredComplaints() {
    const search = this.searchControl.value?.toLowerCase() || '';
    if (!search) return this.complaints();
    return this.complaints().filter(c =>
      c.title.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.category.toLowerCase().includes(search)
    );
  }

  get mapPoints(): MapPoint[] {
    return this.filteredComplaints.map(c => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      title: c.title,
      color: this.PrioritiesColors[c.priority],
      popupContent: `
        <div style="font-family: 'Raleway', sans-serif;">
          <span style="color: var(--blue-10); font-size: 1.1rem; line-clamp: 1; word-break: break-all; -webkit-box-orient: vertical; -webkit-line-clamp: 1;">${c.title}</strong>
          <p style="margin: 8px 0; font-size: 0.9rem; color: var(--gray-11); word-break: break-all">${c.description.substring(0, 100)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--gray-5); padding-top: 8px;">
            <span style="font-size: 0.8rem; font-weight: 600; color: ${this.PrioritiesColors[c.priority]};">${c.category}</span>
            <span style="font-size: 0.8rem; color: var(--gray-9);">${new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      `
    }));
  }
}
