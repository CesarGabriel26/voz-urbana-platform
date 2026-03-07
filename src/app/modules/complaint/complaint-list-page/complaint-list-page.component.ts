import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { Card } from '../../../components/card/card';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { ComplaintService } from '../../../services/complaint.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-complaint-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MapComponent, Card, FormInputComponent],
  templateUrl: './complaint-list-page.component.html',
  styleUrl: './complaint-list-page.component.scss'
})
export class ComplaintListPage implements OnInit {
  @ViewChild(MapComponent) map!: MapComponent;

  private complaintService = inject(ComplaintService);
  private route = inject(ActivatedRoute);

  searchControl = new FormControl('');
  isMyComplaints = false;
  complaints: any[] = [];
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
      this.complaints = data;
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
    if (!search) return this.complaints;
    return this.complaints.filter(c => 
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
      color: c.color,
      popupContent: `
        <div style="font-family: 'Raleway', sans-serif;">
          <strong style="color: var(--blue-10); font-size: 1.1rem;">${c.title}</strong>
          <p style="margin: 8px 0; font-size: 0.9rem; color: var(--gray-11);">${c.description.substring(0, 100)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--gray-5); padding-top: 8px;">
            <span style="font-size: 0.8rem; font-weight: 600; color: ${c.color};">${c.category}</span>
            <span style="font-size: 0.8rem; color: var(--gray-9);">${c.date}</span>
          </div>
        </div>
      `
    }));
  }
}
