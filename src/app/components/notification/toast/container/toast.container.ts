import { Component, Input } from "@angular/core";
import { ToastService } from "../toast.service";
import { ToastComponent } from "../visual/toast";
import { Observable } from "rxjs";
import { Notification } from "../../notification";
import { AsyncPipe, NgClass } from "@angular/common";

@Component({
    selector: "m-toast-container",
    templateUrl: "./toast.container.html",
    styleUrl: "./toast.container.scss",
    standalone: true,
    imports: [ToastComponent, AsyncPipe, NgClass],
})
export class ToastContainer {
    @Input()
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | 'top-center' | 'bottom-center' = "top-center";

    toasts$ = new Observable<Notification[]>();
    
    constructor(private toastService: ToastService) {
        this.toasts$ = this.toastService.toasts$;
    }
    
    remove(id: string) {
        this.toastService.remove(id);
    }

}