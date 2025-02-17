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

export interface AuthUser {
    id: string;
    username: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        user?: AuthUser;
    };
}

export interface AuthError {
    message: string;
    status: number;
} 