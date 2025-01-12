export interface Message {
    id: number;
    username: string;
    sms_content: string;
    rec_time?: string;
    received_at: number;
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