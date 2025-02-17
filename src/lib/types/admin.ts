export interface AdminTokenPayload {
    id: string;
    username: string;
    role: 'admin';
    exp: number;
}

export interface AdminLoginCredentials {
    username: string;
    password: string;
}

export interface AdminResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        admin?: {
            id: string;
            username: string;
        };
    };
}

export interface AdminSession {
    isAuthenticated: boolean;
    admin: {
        id: string;
        username: string;
    } | null;
    loading: boolean;
} 