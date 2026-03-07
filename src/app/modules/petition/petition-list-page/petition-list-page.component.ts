import { Component, ViewChild, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { Card } from '../../../components/card/card';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { PetitionService } from '../../../services/petition.service';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Petition } from '../../../types/Petition';

@Component({
  selector: 'app-petition-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MapComponent, Card, FormInputComponent, ProgressBarComponent],
  templateUrl: './petition-list-page.component.html',
  styleUrl: './petition-list-page.component.scss'
})
export class PetitionListPage implements OnInit {
  @ViewChild(MapComponent) map!: MapComponent;

  private petitionService = inject(PetitionService);
  private route = inject(ActivatedRoute);

  searchControl = new FormControl('');
  isMyPetitions = false;
  petitions = signal<Petition[]>([]);
  isLoading = true;

  ngOnInit() {
    this.isMyPetitions = this.route.snapshot.data['isMyPetitions'] || false;
    this.loadPetitions();

    // Search focus logic
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && this.filteredPetitions.length > 0) {
        const first = this.filteredPetitions[0];
        this.map?.focusOn(first.location.latitude, first.location.longitude, 15);
      }
    });
  }

  loadPetitions() {
    this.isLoading = true;
    const obs = this.isMyPetitions 
      ? this.petitionService.getMyPetitions() 
      : this.petitionService.getPetitions();

    obs.subscribe(data => {
      this.petitions.set(data);
      this.isLoading = false;
    });
  }

  onCardClick(item: any) {
    this.map?.focusOn(item.location.latitude, item.location.longitude, 17);
  }

  onMapPointClick(point: MapPoint) {
    const element = document.getElementById(`petition-${point.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  get filteredPetitions() {
    const search = this.searchControl.value?.toLowerCase() || '';
    if (!search) return this.petitions();
    return this.petitions().filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.location.neighborhood.toLowerCase().includes(search)
    );
  }

  get mapPoints(): MapPoint[] {
    return this.filteredPetitions.map(p => ({
      id: p.id,
      lat: p.location.latitude,
      lng: p.location.longitude,
      title: p.title,
      color: 'var(--blue-10)',
      popupContent: `
        <div style="font-family: 'Raleway', sans-serif;">
            <strong style="color: var(--blue-10); font-size: 1.1rem;">${p.title}</strong>
            <p style="margin: 8px 0; font-size: 0.9rem; color: var(--gray-11);">${p.description.substring(0, 100)}...</p>
            <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--gray-5); padding-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--blue-10);">${p.category}</span>
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
    }));
  }
}
