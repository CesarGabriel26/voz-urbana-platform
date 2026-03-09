import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../../components/tabs/visual/tabs';
import { TabsService } from '../../components/tabs/tabs.service';
import { DeshboardPage } from './deshboard/deshboard-page';
import { CategoriesPage } from './categories/categories';

@Component({
  selector: 'app-admin-page',
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
        label: 'Dashboard',
        component: DeshboardPage
      },
      {
        label: 'Categorias',
        component: CategoriesPage
      }
    ])
  }
}
