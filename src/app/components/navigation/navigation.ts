import { Component, ElementRef, HostBinding, HostListener, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  link?: string; // Optional if it has children
  exact?: boolean;
  children?: NavItem[];
  onClick?: () => void;
  isVisible?: () => boolean;
  type?: 'btn-link' | 'link-item';
  icon?: string;
  variant?: 'default' | 'icon-only' | 'profile';
}

@Component({
  selector: 'm-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  constructor(private elementRef: ElementRef) { }

  @Input() brandName: string = 'VOZ URBANA';
  @Input() brandLogo: string = '';
  @Input() primaryItems: NavItem[] = [];
  @Input() secondaryItems: NavItem[] = [];
  @Input() position: 'static' | 'sticky' = 'static';
  @HostBinding('class.sticky') get isSticky() { return this.position === 'sticky'; }
  @HostBinding('style.display') get display() { return 'block'; }
  @HostBinding('style.z-index') get zIndex() { return this.position === 'sticky' ? '1000' : 'auto'; }

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

  decodeCLick(item: NavItem, event: Event) {
    console.log('a');
    
    if (item.onClick) {
      item.onClick();
    } else if (item.children) {
      this.toggleDropdown(item, event);
    } else {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openDropdown = null;
    }
  }
}
