export interface WebhookUser {
    id: number;
    username: string;
    webhookKey: string;
    createdAt: number;
}

export interface WebhookUserResponse {
    success: boolean;
    message?: string;
    users?: WebhookUser[];
    user?: WebhookUser;
} 