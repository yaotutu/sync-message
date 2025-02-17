import { toast } from 'sonner';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

interface RequestConfig extends RequestInit {
    showError?: boolean;
    showSuccess?: boolean;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // 不再从 localStorage 获取 token，因为我们使用 httpOnly cookie
        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();

        if (!response.ok) {
            // 401 状态码特殊处理
            if (response.status === 401) {
                return {
                    success: false,
                    message: data.message || '未登录或会话已过期'
                };
            }
            throw new Error(data.message || '请求失败');
        }

        return data;
    }

    async get<T = any>(path: string): Promise<ApiResponse<T>> {
        const response = await fetch(path, {
            credentials: 'include', // 确保发送 cookies
            headers: this.getHeaders()
        });

        return this.handleResponse<T>(response);
    }

    async post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(path, {
            method: 'POST',
            credentials: 'include', // 确保发送 cookies
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        return this.handleResponse<T>(response);
    }

    async put<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(path, {
            method: 'PUT',
            credentials: 'include', // 确保发送 cookies
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        return this.handleResponse<T>(response);
    }

    async delete<T = any>(path: string): Promise<ApiResponse<T>> {
        const response = await fetch(path, {
            method: 'DELETE',
            credentials: 'include', // 确保发送 cookies
            headers: this.getHeaders()
        });

        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient(); 