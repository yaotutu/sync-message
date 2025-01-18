'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ContactModal from './ContactModal';

const Footer: React.FC = () => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <>
            <footer className="w-full bg-gray-100 dark:bg-gray-900 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                        <div className="flex flex-col md:flex-row items-center md:space-x-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                © {new Date().getFullYear()} Sync Message
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                支持私有化部署及功能定制，欢迎咨询
                            </div>
                        </div>
                        <nav className="flex space-x-4">
                            <Link
                                href="https://github.com/yaotutu/sync-message"
                                target="_blank"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                关于我们
                            </Link>
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                联系方式
                            </button>
                            <Link
                                href="/privacy"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                隐私政策
                            </Link>
                        </nav>
                    </div>
                </div>
            </footer>
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    );
};

export default Footer;