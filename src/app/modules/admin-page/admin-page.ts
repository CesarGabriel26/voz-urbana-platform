import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../../components/tabs/visual/tabs';
import { TabsService } from '../../components/tabs/tabs.service';
import { DashboardOverview } from './dashboard/overview/overview';
import { DashboardMapView } from './dashboard/map-view/map-view';
import { DashboardAnalytics } from './dashboard/analytics/analytics';
import { DashboardAlerts } from './dashboard/alerts/alerts';
import { CategoriesPage } from './categories/categories';
import { ComplaintsPage } from './complaints/complaints';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage implements OnInit {
  
  constructor(
    private tabsService: TabsService
  ) { }
  
  ngOnInit(): void {
    this.tabsService.setTabs([
      {
        label: 'Painel Geral',
        component: DashboardOverview
      },
      {
        label: 'Mapa Inteligente',
        component: DashboardMapView
      },
      {
        label: 'Estatísticas',
        component: DashboardAnalytics
      },
      {
        label: 'Alertas Urgentes',
        component: DashboardAlerts
      },
      {
        label: 'Categorias',
        component: CategoriesPage
      },
      {
        label: 'Reclamações',
        component: ComplaintsPage
      }
    ])
  }
}
