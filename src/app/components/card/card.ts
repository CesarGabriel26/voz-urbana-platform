import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() color: string = 'var(--blue-10)';
}
