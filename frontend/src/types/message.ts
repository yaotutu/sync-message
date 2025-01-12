export interface Message {
    id: number;
    content: string;
    type: 'text' | 'image' | 'file';
    createdAt: number;
}

export interface CardKeyValidateResponse {
    success: boolean;
    message?: string;
    username?: string;
    expired?: boolean;
    expiresIn?: number;
    firstUsedAt?: number;
}

export interface MessageResponse {
    success: boolean;
    message?: string;
    messages?: Message[];
} 