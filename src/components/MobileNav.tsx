import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileNavProps {
    username: string;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function MobileNav({ username, isOpen, onClose, onLogout }: MobileNavProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // 等待动画完成
    };

    return (
        <>
            {/* 背景遮罩 */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={handleClose}
            />

            {/* 侧边导航菜单 */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    ${isClosing ? 'translate-x-full' : ''}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* 顶部用户信息 */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {username} 的空间
                        </div>
                    </div>

                    {/* 导航链接 */}
                    <nav className="flex-1 px-2 py-4">
                        <Link
                            href={`/user/${username}/profile`}
                            className="block px-4 py-3 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            onClick={onClose}
                        >
                            个人设置
                        </Link>
                        <Link
                            href={`/user/${username}/products`}
                            className="block px-4 py-3 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            onClick={onClose}
                        >
                            商品管理
                        </Link>
                        <Link
                            href={`/user/${username}/cardkeys`}
                            className="block px-4 py-3 mb-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            onClick={onClose}
                        >
                            卡密管理
                        </Link>
                    </nav>

                    {/* 底部退出按钮 */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onLogout}
                            className="w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-center"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}