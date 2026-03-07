import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPage {
  team = [
    {
      name: 'Cesar Gabriel',
      role: 'Desenvolvedor Full Stack',
      description: 'Responsável pela arquitetura do sistema e implementação da plataforma.',
      initials: 'CG'
    },
    {
      name: 'Emanuelly Dias',
      role: 'UX/UI Designer',
      description: 'Responsável pela criação da identidade visual, layout e experiência do usuário.',
      initials: 'ED'
    },
    {
      name: 'Luis Otavio',
      role: 'Desenvolvedor Backend',
      description: 'Responsável pelo desenvolvimento e suporte técnico do sistema.',
      initials: 'LO'
    },
    {
      name: 'Samuel Antonio',
      role: 'Pesquisa e Legislação',
      description: 'Responsável pela pesquisa sobre legislação e requisitos de petições públicas.',
      initials: 'SA'
    }
  ];

  goals = [
    {
      icon: 'report',
      title: 'Reportar Problemas',
      description: 'Ferramenta acessível para registrar questões urbanas com fotos e localização.'
    },
    {
      icon: 'groups',
      title: 'Mobilização Coletiva',
      description: 'Crie e participe de abaixo-assinados para solicitar melhorias reais.'
    },
    {
      icon: 'visibility',
      title: 'Transparência',
      description: 'Acompanhe as demandas da sua região e a comunicação com as autoridades.'
    },
    {
      icon: 'engineering',
      title: 'Gestão Urbana',
      description: 'Incentive a melhoria na infraestrutura através da participação ativa.'
    }
  ];
}
