import { Injectable } from "@angular/core";
import { ToastService } from "./toast/toast.service";
import { NotificationResume } from "./notification";


@Injectable({ providedIn: "root" })
export class ModernNotificationService {

    constructor(
        private toastService: ToastService
    ) { }

    toastProvider(notification: NotificationResume) {
        this.toastService.show({
            ...notification,
            id: crypto.randomUUID()
        });
    }

    toast = {
        success: (message: string, title?: string) => {

            this.toastProvider({
                title,
                message,
                type: "success"
            });

        },

        error: (message: string, title?: string) => {

            this.toastProvider({
                title,
                message,
                type: "error"
            });

        },

        warning: (message: string, title?: string) => {

            this.toastProvider({
                title,
                message,
                type: "warning"
            });

        },

        info: (message: string, title?: string) => {

            this.toastProvider({
                title,
                message,
                type: "info"
            });

        }

    };
}