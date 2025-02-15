import { apiClient } from './client';
import { SimpleCardKey, LinkedCardKey } from '@/types/cardKey';

interface CardKeyGenerateParams {
    count: number;
    phones?: string[];
    appName?: string;
    linkParams: {
        includePhone: boolean;
        includeAppName: boolean;
    };
}

interface VerifyCardKeyParams {
    cardKey: string;
    phone?: string;
}

// 普通卡密服务
export const simpleCardKeyService = {
    // 获取普通卡密列表
    getCardKeys: (username: string) =>
        apiClient.get<SimpleCardKey[]>(`/api/user/${username}/simple-cardkeys`),

    // 生成普通卡密
    generateCardKeys: (username: string, count: number) =>
        apiClient.post<SimpleCardKey[]>(`/api/user/${username}/simple-cardkeys/generate`, { count }, {
            showSuccess: true
        }),

    // 验证普通卡密
    verifyCardKey: (username: string, cardKey: string) =>
        apiClient.post(`/api/user/${username}/simple-cardkeys/verify`, { cardKey }),
};

// 带链接卡密服务
export const linkedCardKeyService = {
    // 获取带链接卡密列表
    getCardKeys: (username: string) =>
        apiClient.get<LinkedCardKey[]>(`/api/user/${username}/linked-cardkeys`),

    // 生成带链接卡密
    generateCardKeys: (username: string, params: {
        count: number;
        phones?: string[];
        appName?: string;
        linkParams: {
            includePhone: boolean;
            includeAppName: boolean;
        };
    }) =>
        apiClient.post<LinkedCardKey[]>(`/api/user/${username}/linked-cardkeys/generate`, params, {
            showSuccess: true
        }),

    // 验证带链接卡密
    verifyCardKey: (username: string, params: { cardKey: string; phone?: string }) =>
        apiClient.post(`/api/user/${username}/linked-cardkeys/verify`, params),
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