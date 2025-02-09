import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface MobileNavProps {
    username: string;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function MobileNav({ username, isOpen, onClose, onLogout }: MobileNavProps) {
    const [isClosing, setIsClosing] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchMoveX = useRef(0);

    // 重置过渡状态
    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    // 处理关闭动画
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300); // 等待动画完成
    }, [onClose]);

    // 处理触摸开始
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchMoveX.current = e.touches[0].clientX;
    }, []);

    // 处理触摸移动
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchMoveX.current = e.touches[0].clientX;
        const deltaX = touchMoveX.current - touchStartX.current;

        // 只处理向右滑动
        if (deltaX > 0 && menuRef.current) {
            menuRef.current.style.transform = `translateX(${deltaX}px)`;
            menuRef.current.style.transition = 'none';
        }
    }, []);

    // 处理触摸结束
    const handleTouchEnd = useCallback(() => {
        const deltaX = touchMoveX.current - touchStartX.current;

        if (menuRef.current) {
            menuRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            menuRef.current.style.transform = '';
        }

        // 如果滑动距离超过100px，关闭菜单
        if (deltaX > 100) {
            handleClose();
        }
    }, [handleClose]);

    return (
        <>
            {/* 背景遮罩 - 优化动画和交互 */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-40
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* 侧边导航菜单 - 改进手势和动画 */}
            <div
                ref={menuRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-lg z-50
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    ${isClosing ? 'translate-x-full' : ''}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* 顶部用户信息 - 优化视觉层级 */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/95">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {username} 的空间
                        </div>
                    </div>

                    {/* 导航链接 - 优化触摸区域和视觉反馈 */}
                    <nav className="flex-1 overflow-y-auto overscroll-contain py-2">
                        <Link
                            href={`/user/${username}/profile`}
                            className="flex items-center h-12 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                            onClick={onClose}
                        >
                            个人设置
                        </Link>
                        <Link
                            href={`/user/${username}/products`}
                            className="flex items-center h-12 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                            onClick={onClose}
                        >
                            商品管理
                        </Link>
                        <Link
                            href={`/user/${username}/cardkeys`}
                            className="flex items-center h-12 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                            onClick={onClose}
                        >
                            卡密管理
                        </Link>
                    </nav>

                    {/* 底部退出按钮 - 优化视觉层级和触摸反馈 */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/95">
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center w-full h-12 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 rounded-md transition-colors"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}