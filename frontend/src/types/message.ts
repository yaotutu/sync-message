export interface Message {
    content: string;
    sms_content: string;
    rec_time: string | null;
    received_at: number;
}

export interface CardKeyValidateResponse {
    success: boolean;
    username?: string;
    message?: string;
    expired?: boolean;
    expiresIn?: number;
    firstUsedAt?: number;
} 