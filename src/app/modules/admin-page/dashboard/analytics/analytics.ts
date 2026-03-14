import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DashboardStats } from '../../../../services/stats.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { getPriorityColor } from '../../../../utils/priority';
import { CategoryService } from '../../../../services/category.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class DashboardAnalytics implements OnInit {
  private statsService = inject(StatsService);
  stats = signal<DashboardStats | null>(null);

  constructor(
    private categoryService: CategoryService
  ) { }

  // para cada categoria usar hsl para obter uma cor
  colorScheme = signal<Color>({
    name: 'dynamic',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      'hsl(0, 100%, 50%)',
      'hsl(60, 100%, 50%)',
      'hsl(120, 100%, 50%)',
      'hsl(180, 100%, 50%)',
      'hsl(240, 100%, 50%)',
      'hsl(300, 100%, 50%)'
    ]
  });

  ngOnInit(): void {
    this.statsService.getDashboardStats().subscribe(data => this.stats.set(data));

    this.categoryService.getCategories().subscribe(categories => {
      const count = categories.length || 1;

      this.colorScheme.set({
        name: 'dynamic',
        selectable: true,
        group: ScaleType.Ordinal,
        // Dividimos 360 pelo total de itens para garantir o espaçamento máximo entre as cores
        domain: categories.map((_, index) => {
          const goldenRatioConjugate = 0.618033988749895;
          const hue = (index * goldenRatioConjugate * 360) % 360;
          return `hsl(${hue}, 70%, 50%)`;
        })
      });
    });
  }
}
