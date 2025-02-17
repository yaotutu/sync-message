export interface UserCreateInput {
    username: string;
    password: string;
}

export interface UserResponse {
    success: boolean;
    message?: string;
    data?: {
        user?: {
            id: string;
            username: string;
            webhookKey: string;
            createdAt: Date;
        };
    };
}

export interface UserListResponse {
    success: boolean;
    message?: string;
    data?: {
        users: Array<{
            id: string;
            username: string;
            webhookKey: string;
            createdAt: Date;
        }>;
    };
} 