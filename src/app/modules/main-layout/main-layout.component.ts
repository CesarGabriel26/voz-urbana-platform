import { Component } from '@angular/core';
import { Navigation, NavItem } from '../../components/navigation/navigation';
import { AuthService } from '../../services/auth.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout.component',
  imports: [Navigation, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {

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
          label: 'Meus Abaixo Assinados',
          link: '/mypetitions',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Explorar',
          link: '/petitions'
        },
      ]
    },
    {
      label: 'Reclamações',
      children: [
        {
          label: 'Criar Reclamação',
          link: '/complaint/create',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Minhas Reclamações',
          link: 'mycomplaints',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Reclamações locais', link: '/complaints'

        },
      ]
    },
    { label: 'Sobre', link: '/about' },
  ];

  authItems: NavItem[] = [
    {
      label: 'Login',
      link: '/login',
      isVisible: () => !this.authService.isAuthenticated()
    },
    {
      label: 'Register',
      link: '/signup',
      isVisible: () => !this.authService.isAuthenticated()
    }
  ];
}
