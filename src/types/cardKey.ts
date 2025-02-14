// 普通卡密类型
export interface SimpleCardKey {
    id: string;
    key: string;
    userId: string;
    used: boolean;
    usedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// 带链接卡密类型
export interface LinkedCardKey {
    id: string;
    key: string;
    userId: string;
    phone?: string;
    appName?: string;
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
}

export type CardKeyStatus = 'all' | 'used' | 'unused'; 