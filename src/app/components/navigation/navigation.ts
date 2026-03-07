import { Component, ElementRef, HostListener, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  link?: string; // Optional if it has children
  exact?: boolean;
  children?: NavItem[];
  isVisible?: () => boolean;
}

@Component({
  selector: 'm-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  constructor(private elementRef: ElementRef) {}

  @Input() brandName: string = 'VOZ URBANA';
  @Input() brandLogo: string = '';
  @Input() primaryItems: NavItem[] = [];
  @Input() secondaryItems: NavItem[] = [];

  isMenuOpen = signal(false);
  openDropdown: NavItem | null = null;

  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
    if (!this.isMenuOpen()) {
      this.openDropdown = null;
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.openDropdown = null;
  }

  toggleDropdown(item: NavItem, event: Event) {
    if (item.children) {
      event.preventDefault();
      event.stopPropagation();
      this.openDropdown = this.openDropdown === item ? null : item;
    }
  }

  isDropdownOpen(item: NavItem): boolean {
    return this.openDropdown === item;
  }

  shouldShowItem(item: NavItem): boolean {
    return item.isVisible ? item.isVisible() : true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openDropdown = null;
    }
  }
}
