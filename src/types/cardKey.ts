export interface CardKey {
    id: string;
    key: string;
    userId: string;
    used: boolean;
    usedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CardKeyStatus = 'all' | 'used' | 'unused'; 