import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss'
})
export class StepsComponent {
  @Input() steps: string[] = [];
  @Input() currentStep: number = 0;

  isCompleted(index: number): boolean {
    return index < this.currentStep;
  }

  isActive(index: number): boolean {
    return index === this.currentStep;
  }
}
