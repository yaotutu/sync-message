import { ApiResponse } from '@/lib/types';

export const linkedCardKeyService = {
    // ... existing methods ...

    async deleteAllCardKeys(username: string): Promise<ApiResponse<void>> {
        try {
            const response = await fetch(`/api/user/${username}/linked-cardkeys/all`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting all card keys:', error);
            return {
                success: false,
                message: '删除失败，请稍后重试',
            };
        }
    },
}; 