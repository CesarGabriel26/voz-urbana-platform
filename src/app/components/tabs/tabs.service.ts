import { Injectable, Type } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Tab } from "./tab";

@Injectable({ providedIn: "root" })
export class TabsService {

    private tabs = new BehaviorSubject<Tab[]>([]);
    public tabs$ = this.tabs.asObservable();

    addTab(tab: Tab) {
        this.tabs.next([...this.tabs.getValue(), tab]);
    }

    removeTab(id: string) {
        this.tabs.next(this.tabs.getValue().filter(tab => tab.id !== id));
    }

    addTabs(tabs: Tab[]) {
        const newTabs = tabs.map(tab => ({ ...tab, id: crypto.randomUUID() }));
        this.tabs.next([...this.tabs.getValue(), ...newTabs]);
    }

    setTabs(tabs: Tab[]) {
        const newTabs = tabs.map(tab => ({ ...tab, id: crypto.randomUUID() }));
        this.tabs.next(newTabs);
    }
}