export interface CardKey {
    id: number;
    key: string;
    username: string;
    status: 'unused' | 'used';
    createdAt: number;
    usedAt: number | null;
    expiresIn: number | null;
}

export interface User {
    id: number;
    username: string;
    webhookKey: string;
    createdAt: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
} 