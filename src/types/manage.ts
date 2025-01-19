export interface User {
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

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: Error;
} 