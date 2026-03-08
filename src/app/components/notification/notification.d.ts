export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
    id: string;
    title?: string;
    message: string;
    type?: NotificationType;
    duration?: number;
    action?: {
        label: string;
        callback: () => void;
    };
}

export interface NotificationResume {
    title?: string;
    message: string;
    type?: NotificationType;
    duration?: number;
    action?: {
        label: string;
        callback: () => void;
    };
}