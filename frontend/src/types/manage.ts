export interface WebhookUser {
    id: number;
    username: string;
    webhookKey: string;
    createdAt: number;
}

export interface MessageTemplate {
    id: number;
    name: string;
    content: string;
    createdAt: number;
}

export interface ManageResponse {
    success: boolean;
    message?: string;
    users?: WebhookUser[];
    templates?: MessageTemplate[];
}

export interface WebhookUserResponse {
    success: boolean;
    message?: string;
    user?: WebhookUser;
}

export interface MessageTemplateResponse {
    success: boolean;
    message?: string;
    template?: MessageTemplate;
} 