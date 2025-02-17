import { toast } from 'sonner';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
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
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('user_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();

        if (!response.ok && response.status !== 401) {
            throw new Error(data.message || '请求失败');
        }

        return data;
    }

    async get<T = any>(url: string): Promise<ApiResponse<T>> {
        const response = await fetch(url, {
            credentials: 'include',
            headers: this.getHeaders()
        });

        return this.handleResponse<T>(response);
    }

    async post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        return this.handleResponse<T>(response);
    }

    async put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
        const response = await fetch(url, {
            method: 'PUT',
            credentials: 'include',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        return this.handleResponse<T>(response);
    }

    async delete<T = any>(url: string): Promise<ApiResponse<T>> {
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
            headers: this.getHeaders()
        });

        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient(); 