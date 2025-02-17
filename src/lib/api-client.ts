export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = path.startsWith('http') ? path : path;
        const defaultOptions: RequestInit = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            });

            const data = await response.json();

            // 401 未登录状态不应该抛出错误
            if (!response.ok && response.status !== 401) {
                throw new Error(data.message || '请求失败');
            }

            return data;
        } catch (error: any) {
            console.error('API 请求失败:', error);
            throw error;
        }
    }

    async get<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    async post<T>(path: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

export const apiClient = new ApiClient(); 