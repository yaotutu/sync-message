export interface User {
    id: number;
    username: string;
    webhookKey?: string;
    createdAt: number;
}

export interface KeyLog {
    id: number;
    key: string;
    username: string;
    status: 'success' | 'invalid';
    createdAt: number;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    users?: User[];
    user?: User;
    keys?: string[];
    logs?: KeyLog[];
} 