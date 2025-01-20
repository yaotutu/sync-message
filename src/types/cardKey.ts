export interface CardKey {
    id: string;
    key: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    used: boolean;
    usedAt?: Date;
    expiresIn?: number;  // 剩余时间（毫秒）
}

export type CardKeyStatus = 'all' | 'used' | 'unused'; 