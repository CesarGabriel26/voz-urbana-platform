import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapPoint } from '../../../../components/map/map';
import { PetitionService } from '../../../../services/petition.service';
import { ComplaintService } from '../../../../services/complaint.service';
import { getPriorityColor } from '../../../../utils/priority';

@Component({
  selector: 'app-dashboard-map',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss'
})
export class DashboardMapView implements OnInit {
  private petitionService = inject(PetitionService);
  private complaintService = inject(ComplaintService);

  petitions = signal<any[]>([]);
  complaints = signal<any[]>([]);

  ngOnInit(): void {
    this.petitionService.getPetitions().subscribe(data => this.petitions.set(data));
    this.complaintService.getComplaints().subscribe(data => this.complaints.set(data));
  }

  get mapPoints(): MapPoint[] {
    return [
      ...this.petitions()
        .filter(p => p.location && p.location.lat && p.location.lng)
        .map(p => ({
          id: p.id,
          lat: p.location.lat,
          lng: p.location.lng,
          title: p.title,
          color: 'var(--blue-10)',
          popupContent: `<div class="map-popup"><strong>${p.title}</strong><p>${p.description.substring(0, 50)}...</p></div>`
        })),
      ...this.complaints()
        .filter(c => c.lat && c.lng)
        .map(c => ({
          id: c.id,
          lat: c.lat,
          lng: c.lng,
          title: c.title,
          color: getPriorityColor(c.priority),
          popupContent: `<div class="map-popup"><strong>${c.title}</strong><p>${c.description.substring(0, 50)}...</p></div>`
        }))
    ];
  }
}
