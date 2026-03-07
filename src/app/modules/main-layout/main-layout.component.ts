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
}
