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
    { label: 'Inicio', link: '/', exact: true, icon: 'home' },
    {
      label: 'Abaixo Assinados',
      icon: 'description',
      children: [
        {
          label: 'Criar Abaixo Assinado',
          link: '/petition/create',
          icon: 'add_circle',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Meus Abaixo Assinados',
          link: '/mypetitions',
          icon: 'list_alt',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Explorar',
          link: '/petitions',
          icon: 'explore'
        },
      ]
    },
    {
      label: 'Reclamações',
      icon: 'report_problem',
      children: [
        {
          label: 'Criar Reclamação',
          link: '/complaint/create',
          icon: 'add_comment',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Minhas Reclamações',
          link: 'mycomplaints',
          icon: 'history',
          isVisible: () => this.authService.isAuthenticated()
        },
        {
          label: 'Reclamações locais',
          link: '/complaints',
          icon: 'location_on'
        },
      ]
    },
    { label: 'Sobre', link: '/about', icon: 'info' },
  ];

  authItems: NavItem[] = [
    {
      label: 'Login',
      link: '/login',
      icon: 'login',
      isVisible: () => !this.authService.isAuthenticated()
    },
    {
      label: 'Register',
      link: '/signup',
      icon: 'person_add',
      isVisible: () => !this.authService.isAuthenticated()
    },
    {
      label: 'Portal',
      variant: 'profile',
      isVisible: () => this.authService.isAuthenticated(),
      type: 'link-item',
      children: [
        {
          label: 'Painel ADM',
          link: '/admin',
          icon: 'admin_panel_settings',
          isVisible: () => (this.authService.isAuthenticated() && this.authService.getRole()?.toLocaleLowerCase() == 'admin'),
        },
        {
          label: 'Configurações',
          link: '/settings',
          icon: 'settings',
        },
        {
          label: 'Sair',
          icon: 'logout',
          onClick: () => {
            this.authService.logout();
            window.location.reload();
          }
        }
      ]
    },
  ];
}
