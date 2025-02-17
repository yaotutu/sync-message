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

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        const { showError = true, showSuccess = false, ...requestConfig } = config;

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...requestConfig,
                headers: {
                    'Content-Type': 'application/json',
                    ...requestConfig.headers,
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                if (showError && data.message) {
                    toast.error(data.message);
                }
                return data;
            }

            if (showSuccess && data.message) {
                toast.success(data.message);
            }

            return data;
        } catch (error) {
            const message = error instanceof Error ? error.message : '请求失败';
            if (showError) {
                toast.error(message);
            }
            throw error;
        }
    }

    async get<T>(endpoint: string, config: RequestConfig = {}) {
        return this.request<T>(endpoint, {
            method: 'GET',
            ...config,
        });
    }

    async post<T>(endpoint: string, data?: any, config: RequestConfig = {}) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...config,
        });
    }

    async put<T>(endpoint: string, data?: any, config: RequestConfig = {}) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...config,
        });
    }

    async delete<T>(endpoint: string, config: RequestConfig = {}) {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...config,
        });
    }
}

export const apiClient = new ApiClient(); 