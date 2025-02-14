import { apiClient } from './client';
import { CardKey } from '@/types/cardKey';

interface CardKeyGenerateParams {
    count: number;
    phone?: string;
    appName?: string;
    generateType: 'simple' | 'withLink';
    linkParams: {
        includePhone: boolean;
        includeAppName: boolean;
    };
}

interface VerifyCardKeyParams {
    cardKey: string;
    phone?: string;
}

export const cardKeyService = {
    // 获取卡密列表
    getCardKeys: (username: string) =>
        apiClient.get<CardKey[]>(`/api/user/${username}/cardkeys`),

    // 生成简单卡密
    generateCardKeys: (username: string, count: number) =>
        apiClient.post<CardKey[]>(`/api/user/${username}/cardkeys/generate`, { count }, {
            showSuccess: true
        }),

    // 生成带链接的卡密
    generateCardKeysWithLink: (username: string, params: {
        count: number;
        phone?: string;
        appName?: string;
        linkParams: {
            includePhone: boolean;
            includeAppName: boolean;
        };
    }) =>
        apiClient.post<CardKey[]>(`/api/user/${username}/cardkeys/generate-with-link`, params, {
            showSuccess: true
        }),

    // 验证卡密
    verifyCardKey: (username: string, params: VerifyCardKeyParams) =>
        apiClient.post(`/api/user/${username}/verify-card`, params),
};

export const authService = {
    // 验证登录状态
    verifyLoginStatus: (username: string) =>
        apiClient.get(`/api/user/${username}/verify`),

    // 登出
    logout: (username: string) =>
        apiClient.post(`/api/user/${username}/logout`),
};

export const messageService = {
    // 获取消息列表
    getMessages: (username: string) =>
        apiClient.get(`/api/messages/${username}`),
}; 