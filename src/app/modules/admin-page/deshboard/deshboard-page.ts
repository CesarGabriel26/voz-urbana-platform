import { Component, OnInit, signal } from '@angular/core';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { Petition } from '../../../types/Petition';
import { Complaint } from '../../../types/Complaint';
import { ComplaintService } from '../../../services/complaint.service';
import { PetitionService } from '../../../services/petition.service';
import { getPriorityColor } from '../../../utils/priority';

@Component({
  selector: 'app-deshboard-page',
  imports: [MapComponent],
  templateUrl: './deshboard-page.html',
  styleUrl: './deshboard-page.scss',
})
export class DeshboardPage implements OnInit {

  petitions = signal<Petition[]>([]);
  complaints = signal<Complaint[]>([]);
  stats = signal({
    openComplaints: 0,
    resolvedComplaints: 0,
    openPetitions: 0,
    closedPetitions: 0
  })


  constructor(
    private complaintService: ComplaintService,
    private petitionService: PetitionService
  ) { }

  ngOnInit(): void {
    this.complaintService.getComplaints({ status: "pending" }).subscribe({
      next: (data) => {
        this.stats.set({ ...this.stats(), openComplaints: data.length })
      }
    })
    this.complaintService.getComplaints({ status: "resolved" }).subscribe({
      next: (data) => {
        this.stats.set({ ...this.stats(), resolvedComplaints: data.length })
      }
    })
    this.petitionService.getPetitions({ status: "active" }).subscribe({
      next: (data) => {
        this.stats.set({ ...this.stats(), openPetitions: data.length })
      }
    })
    this.petitionService.getPetitions({ status: "completed" }).subscribe({
      next: (data) => {
        this.stats.set({ ...this.stats(), closedPetitions: data.length })
      }
    })
    this.petitionService.getPetitions().subscribe({
      next: (data) => {
        this.petitions.set(data)
      }
    })
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data)
      }
    })
  }

  get mapPoints(): MapPoint[] {
    let points = [
      ...this.petitions()
        .filter(p => p.location && p.location.lat && p.location.lng)
        .map(p => ({
          id: p.id,
          lat: p.location.lat,
          lng: p.location.lng,
          title: p.title,
          color: 'var(--blue-10)',
          popupContent: `
            <div style="font-family: 'Raleway', sans-serif;">
                <strong style="color: var(--blue-10); font-size: 1.1rem;">${p.title}</strong>
                <p style="margin: 8px 0; font-size: 0.9rem; color: var(--gray-11);">${p.description.substring(0, 100)}...</p>
                <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--gray-5); padding-top: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--blue-10);">${p.category_name}</span>
                        <span style="font-size: 0.8rem; color: var(--gray-9);">${p.location.neighborhood}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: var(--gray-3); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${(p.signaturesCount / p.goal) * 100}%; height: 100%; background: var(--blue-9);"></div>
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--blue-11);">${p.signaturesCount}/${p.goal}</span>
                    </div>
                </div>
            </div>
          `
        })),
      ...this.complaints()
        .filter(c => c.lat && c.lng)
        .map(c => ({
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
      }))
    ]

    return points
  }
}
