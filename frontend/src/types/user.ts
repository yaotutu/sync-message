export interface CardKey {
    id: number;
    key: string;
    status: string;
    createdAt: number;
    firstUsedAt: number | null;
    expiresIn: number | null;
}

export interface User {
    id: number;
    username: string;
    webhookKey: string;
}

export interface UserResponse {
    success: boolean;
    message?: string;
    user?: User;
}

export interface CardKeyResponse {
    success: boolean;
    message?: string;
    cardKeys?: CardKey[];
    key?: string;
} 