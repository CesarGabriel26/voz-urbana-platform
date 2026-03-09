import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { Tab } from '../tab';
import { TabsService } from '../tabs.service';


@Component({
  selector: 'app-tabs',
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class TabsComponent {
  tabs$!: Observable<Tab[]>;

  activeTab = signal<string>('');

  constructor(
    private tabsService: TabsService
  ) {
    this.tabs$ = this.tabsService.tabs$;
    // set first tab as active
    this.tabs$.subscribe(tabs => {
      if (tabs.length > 0) {
        this.setActiveTab(tabs[0]?.id || '');
      }
    });
  }

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }
}
