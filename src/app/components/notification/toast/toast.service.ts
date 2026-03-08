import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Notification } from "../notification";

@Injectable({ providedIn: "root" })
export class ToastService {

    private _toasts = new BehaviorSubject<Notification[]>([]);
    toasts$ = this._toasts.asObservable();

    show(notification: Notification) {

        const list = [...this._toasts.value, notification];
        this._toasts.next(list);

        if (notification.duration !== 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration ?? 4000);
        }
    }

    remove(id: string) {
        this._toasts.next(
            this._toasts.value.filter(t => t.id !== id)
        );
    }

}