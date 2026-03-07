import {
  Component,
  ContentChildren,
  Input,
  QueryList,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselItemDirective } from './carousel-item.directive';

@Component({
  selector: 'm-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel implements OnDestroy {
  @ContentChildren(CarouselItemDirective) items!: QueryList<CarouselItemDirective>;

  @Input() autoPlay = true;
  @Input() interval = 5000;
  @Input() showIndicators = true;
  @Input() showControls = true;

  currentIndex = signal(0);
  private timer: any;

  constructor() {
    effect(() => {
      this.resetTimer();
    });
  }

  next() {
    this.currentIndex.update((val) => (val + 1) % this.items.length);
  }

  prev() {
    this.currentIndex.update((val) => (val - 1 + this.items.length) % this.items.length);
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
  }

  private resetTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.autoPlay) {
      this.timer = setInterval(() => {
        this.next();
      }, this.interval);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
