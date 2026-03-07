import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() max: number = 100;
  @Input() color: string = 'var(--blue-8)';
  @Input() backgroundColor: string = 'var(--gray-3)';
  @Input() showLabel: boolean = true;
  @Input() labelSuffix: string = 'assinaturas';

  get percentage(): number {
    return Math.min((this.value / this.max) * 100, 100);
  }
}
