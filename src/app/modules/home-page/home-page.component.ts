import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Carousel } from '../../components/carousel/carousel';
import { CarouselItemDirective } from '../../components/carousel/carousel-item.directive';
import { Card } from '../../components/card/card';
import { Pagination } from '../../components/pagination/pagination';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { Petition } from '../../types/Petition';
import { Complaint } from '../../types/Complaint';
import { PrioritiesColors } from '../../utils/consts';
import { ComplaintService } from '../../services/complaint.service';
import { PetitionService } from '../../services/petition.service';

@Component({
  selector: 'app-home-page.component',
  standalone: true,
  imports: [CommonModule, RouterModule, Carousel, CarouselItemDirective, Card, Pagination, ProgressBarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage {
  PrioritiesColors = PrioritiesColors;

  pageSize = 4;
  complaintsPage = signal<number>(1);
  petitionsPage = signal<number>(1);

  complaints = signal<Complaint[]>([]);

  petitions = signal<Petition[]>([]);

  constructor(
    private petitionService: PetitionService,
    private complaintService: ComplaintService
  ) {
    this.petitionService.getPetitions().subscribe((petitions) => this.petitions.set(petitions));
    this.complaintService.getComplaints().subscribe((complaints) => this.complaints.set(complaints));
  }

  get paginatedComplaints() {
    const start = (this.complaintsPage() - 1) * this.pageSize;
    return this.complaints().slice(start, start + this.pageSize);
  }

  get paginatedPetitions() {
    const start = (this.petitionsPage() - 1) * this.pageSize;
    return this.petitions().slice(start, start + this.pageSize);
  }

  onComplaintsPageChange(page: number) {
    this.complaintsPage.set(page);
  }

  onPetitionsPageChange(page: number) {
    this.petitionsPage.set(page);
  }
}
