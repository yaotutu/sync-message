import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        © {new Date().getFullYear()} Sync Message. All rights reserved.
                    </div>
                    <div className="mt-4 md:mt-0">
                        <nav className="flex space-x-4">
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                关于我们
                            </a>
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                联系方式
                            </a>
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                                隐私政策
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;