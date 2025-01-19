export interface Message {
    id: number;
    content: string;
    createdAt: number;
    sender: string;
    type: 'text' | 'image' | 'file';
    metadata?: {
        filename?: string;
        filesize?: number;
        mimetype?: string;
        url?: string;
    };
}

export interface CardKeyValidateResponse {
    success: boolean;
    message?: string;
    username?: string;
    expiresIn?: number;
    usedAt?: number;
}

export interface MessageResponse {
    success: boolean;
    message?: string;
    data?: Message[];
} 