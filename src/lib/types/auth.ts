export interface TokenPayload {
    id: string;
    username: string;
    role: 'admin' | 'user';
    exp: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        user?: {
            id: string;
            username: string;
            role: 'admin' | 'user';
        };
    };
}

export interface AuthError {
    message: string;
    status: number;
} 