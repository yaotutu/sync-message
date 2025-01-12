'use client';

import { User } from '@/types/admin';

interface UserListProps {
    users: User[];
    onRefresh: () => void;
    onDeleteUser: (username: string) => void;
}

export default function UserList({ users, onRefresh, onDeleteUser }: UserListProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">用户列表</h2>
                <button
                    onClick={onRefresh}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                    刷新列表
                </button>
            </div>
            <div className="space-y-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200"
                    >
                        <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">
                                创建时间：{new Date(user.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={() => onDeleteUser(user.username)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                            删除
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
} 