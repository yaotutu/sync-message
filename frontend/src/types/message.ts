export interface Message {
    id: number;
    username: string;
    sms_content: string;
    rec_time: string | null;
    received_at: number;
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
    data?: Message[];
} 