export interface CardKey {
    id: string;
    key: string;
    userId: string;
    used: boolean;
    usedAt: string | null;
    createdAt: string;
    updatedAt: string;
    metadata?: {
        phone?: string;
        appName?: string;
        linkParams: {
            includePhone: boolean;
            includeAppName: boolean;
        };
    };
    shareUrl?: string;
}

export type CardKeyStatus = 'all' | 'used' | 'unused'; 