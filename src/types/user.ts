export interface CardKey {
    id: number;
    key: string;
    username: string;
    status: 'unused' | 'used' | 'expired';
    createdAt: number;
    usedAt?: number | null;
    expiresIn?: number;
}

export interface User {
    id: number;
    username: string;
    webhookKey: string;
    createdAt: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
} 