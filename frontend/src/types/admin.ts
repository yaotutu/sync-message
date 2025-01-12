export interface User {
    id: number;
    username: string;
    createdAt: string;
}

export interface KeyLog {
    id: number;
    key: string;
    username: string;
    status: 'success' | 'invalid';
    createdAt: string;
}

export interface AdminResponse {
    success: boolean;
    message?: string;
    users?: User[];
    keys?: string[];
    logs?: KeyLog[];
} 