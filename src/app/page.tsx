'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          消息同步系统
        </h1>
        <div className="space-y-4">
          <Link
            href="/messages"
            className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            查看消息
          </Link>
          <Link
            href="/cardkey"
            className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            卡密管理
          </Link>
          <Link
            href="/manage"
            className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            管理后台
          </Link>
        </div>
      </div>
    </div>
  );
}
