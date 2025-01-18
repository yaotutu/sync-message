import React from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">联系方式</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-center">
                        <img
                            src="/wechat-qr.jpg"
                            alt="微信二维码"
                            className="w-64 h-64 object-cover rounded-lg mb-4"
                        />
                        <p className="text-center text-gray-600 dark:text-gray-300">
                            如需定制开发、系统部署或其他业务咨询，<br />
                            请扫描上方二维码添加微信咨询
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactModal; 