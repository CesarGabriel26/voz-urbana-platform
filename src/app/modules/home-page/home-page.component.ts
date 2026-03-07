import { Component } from '@angular/core';
import { Navigation, NavItem } from '../../components/navigation/navigation';
import { Carousel } from '../../components/carousel/carousel';
import { CarouselItemDirective } from '../../components/carousel/carousel-item.directive';
import { Card } from '../../components/card/card';
import { Pagination } from '../../components/pagination/pagination';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page.component',
  imports: [Navigation, Carousel, CarouselItemDirective, Card, Pagination],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePage {

  constructor(
    private authService: AuthService
  ) { }

  navItems: NavItem[] = [
    { label: 'Inicio', link: '/', exact: true },
    {
      label: 'Abaixo Assinados',
      children: [
        {
          label: 'Criar Abaixo Assinado',
          link: '/petition/create',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Explorar',
          link: '/petition'
        },
      ]
    },
    {
      label: 'Reclamações',
      children: [
        {
          label: 'Minhas Reclamações',
          link: '/complaint/my',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Reclamações locais', link: '/complaint'

        },
      ]
    },
    { label: 'Sobre', link: '/about' },
  ];

  authItems: NavItem[] = [
    { label: 'Login', link: '/login' },
    { label: 'Register', link: '/signup' },
  ];

  // Grid sizing logic - 2 rows
  // Assuming 4 columns on desktop, 2 rows = 8 items
  // On mobile/tablet this might vary, but 8 is a good baseline for "2 rows" of standard cards
  pageSize = 4;

  complaintsPage = 1;
  petitionsPage = 1;

  // Generic data structure for demo - In a real app this would come from a service
  // I will define them here to allow actual pagination logic in the template
  complaints = Array(20).fill(null).map((_, i) => ({
    title: `Reclamação ${i + 1}`,
    description: i % 2 === 0
      ? 'Quando ocorre uma chuva forte, os bueiros não dão conta e a água sobe rapidamente.'
      : 'Não há postes de luz em minha rua e os poucos que tem estão com a lâmpada queimada.',
    color: ['orange', '#ffc107', '#00eb34', 'red'][i % 4],
    date: '03/12/2024'
  }));

  petitions = Array(15).fill(null).map((_, i) => ({
    title: `Abaixo Assinado ${i + 1}`,
    description: 'Crie e apoie causas que importam para sua comunidade e ajude a melhorar a cidade.',
    color: ['#0060ec', '#0063ef', '#092f6c'][i % 3],
    date: '03/12/2024'
  }));

  get paginatedComplaints() {
    const start = (this.complaintsPage - 1) * this.pageSize;
    return this.complaints.slice(start, start + this.pageSize);
  }

  get paginatedPetitions() {
    const start = (this.petitionsPage - 1) * this.pageSize;
    return this.petitions.slice(start, start + this.pageSize);
  }

  onComplaintsPageChange(page: number) {
    this.complaintsPage = page;
  }

  onPetitionsPageChange(page: number) {
    this.petitionsPage = page;
  }
}
