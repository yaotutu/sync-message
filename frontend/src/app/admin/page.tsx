'use client';

import { useState } from 'react';
import { User, KeyLog, AdminResponse } from '@/types/admin';
import UserList from '@/components/admin/UserList';
import KeyLogs from '@/components/admin/KeyLogs';

export default function AdminPage() {
    const [adminPassword, setAdminPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<KeyLog[]>([]);
    const [keys, setKeys] = useState<string[]>([]);
    const [keyCount, setKeyCount] = useState(5);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [addUserMessage, setAddUserMessage] = useState({ type: '', text: '' });

    const login = async () => {
        try {
            const response = await fetch('/api/cardkey/users', {
                headers: {
                    'x-admin-password': adminPassword
                }
            });

            if (response.ok) {
                const data: AdminResponse = await response.json();
                setIsLoggedIn(true);
                setError('');
                if (data.users) {
                    setUsers(data.users);
                }
                refreshKeyLogs();
            } else {
                setError('管理员密码错误');
            }
        } catch (error) {
            setError('登录失败，请稍后重试');
        }
    };

    const addUser = async () => {
        try {
            const response = await fetch('/api/cardkey/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': adminPassword
                },
                body: JSON.stringify({ username, password })
            });

            const data: AdminResponse = await response.json();
            if (data.success) {
                setAddUserMessage({ type: 'success', text: '用户添加成功' });
                setUsername('');
                setPassword('');
                refreshUsers();
            } else {
                setAddUserMessage({ type: 'error', text: data.message || '添加用户失败' });
            }
        } catch (error) {
            setAddUserMessage({ type: 'error', text: '添加用户失败，请稍后重试' });
        }
    };

    const deleteUser = async (username: string) => {
        if (!confirm(`确定要删除用户 ${username} 吗？`)) {
            return;
        }

        try {
            const response = await fetch(`/api/cardkey/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-password': adminPassword
                }
            });

            const data: AdminResponse = await response.json();
            if (data.success) {
                refreshUsers();
            } else {
                alert(data.message || '删除用户失败');
            }
        } catch (error) {
            alert('删除用户失败，请稍后重试');
        }
    };

    const generateKeys = async () => {
        try {
            const response = await fetch(`/api/cardkey/generate?count=${keyCount}`, {
                headers: {
                    'x-admin-password': adminPassword
                }
            });

            const data: AdminResponse = await response.json();
            if (data.success && data.keys) {
                setKeys(data.keys);
            }
        } catch (error) {
            alert('生成卡密失败，请稍后重试');
        }
    };

    const refreshUsers = async () => {
        try {
            const response = await fetch('/api/cardkey/users', {
                headers: {
                    'x-admin-password': adminPassword
                }
            });

            const data: AdminResponse = await response.json();
            if (data.success && data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('刷新用户列表失败:', error);
        }
    };

    const refreshKeyLogs = async () => {
        try {
            const response = await fetch('/api/cardkey/logs', {
                headers: {
                    'x-admin-password': adminPassword
                }
            });

            const data: AdminResponse = await response.json();
            if (data.success && data.logs) {
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('刷新卡密记录失败:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">消息同步系统管理后台</h1>

            {!isLoggedIn ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">管理员验证</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                                管理员密钥
                            </label>
                            <input
                                type="password"
                                id="adminPassword"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="请输入管理员密钥"
                            />
                        </div>
                        <button
                            onClick={login}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        >
                            验证
                        </button>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">添加用户</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    用户名
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="请输入用户名"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    密码
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="请输入密码"
                                />
                            </div>
                            <button
                                onClick={addUser}
                                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                            >
                                添加用户
                            </button>
                            {addUserMessage.text && (
                                <div
                                    className={`text-sm ${addUserMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                                        }`}
                                >
                                    {addUserMessage.text}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <UserList users={users} onRefresh={refreshUsers} onDeleteUser={deleteUser} />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">生成卡密</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="keyCount" className="block text-sm font-medium text-gray-700">
                                    生成数量
                                </label>
                                <input
                                    type="number"
                                    id="keyCount"
                                    value={keyCount}
                                    onChange={(e) => setKeyCount(Number(e.target.value))}
                                    min="1"
                                    max="100"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <button
                                onClick={generateKeys}
                                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                            >
                                生成卡密
                            </button>
                            {keys.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-md whitespace-pre-wrap break-all">
                                    {keys.join('\n')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <KeyLogs logs={logs} onRefresh={refreshKeyLogs} />
                    </div>
                </div>
            )}
        </div>
    );
} 