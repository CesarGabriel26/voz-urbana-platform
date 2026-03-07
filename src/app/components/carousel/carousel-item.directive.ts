import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[mCarouselItem]',
  standalone: true
})
export class CarouselItemDirective {
  constructor(public template: TemplateRef<any>) {}
}
