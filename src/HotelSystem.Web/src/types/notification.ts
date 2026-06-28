export type NotificationType = 'Info' | 'Success' | 'Warning' | 'Error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
}
