'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, CardKeyValidateResponse } from '@/types/message';
import MessageList from '@/components/MessageList';
import Countdown from '@/components/Countdown';

export default function HomePage() {
  const [cardKey, setCardKey] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [expiresIn, setExpiresIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!cardKey) {
      setError('请输入卡密');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cardkey/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cardKey })
      });

      const data = await response.json() as CardKeyValidateResponse;
      if (data.success) {
        setIsLoggedIn(true);
        setUsername(data.username || '');
        setExpiresIn(data.expiresIn || 0);
        setError('');
        loadMessages();
      } else {
        setError(data.message || '卡密验证失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('卡密验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: { 'x-card-key': cardKey }
      });

      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
        setError('');
      } else {
        setError(data.message || '加载消息失败');
      }
    } catch (error) {
      console.error('Load messages error:', error);
      setError('加载消息失败，请稍后重试');
    }
  }, [cardKey]);

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, loadMessages]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCardKey('');
    setMessages([]);
    setExpiresIn(0);
    setError('');
  };

  const handleExpire = () => {
    handleLogout();
    setError('卡密已过期');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="flex flex-col">
                    <label className="leading-loose">卡密</label>
                    <input
                      type="text"
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      value={cardKey}
                      onChange={(e) => setCardKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && login()}
                      placeholder="请输入卡密"
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mt-2">
                      {error}
                    </div>
                  )}
                  <button
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    onClick={login}
                    disabled={isLoading}
                  >
                    {isLoading ? '验证中...' : '验证'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {username}
                </h3>
                <Countdown expiresIn={expiresIn} onExpire={handleExpire} />
              </div>
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={handleLogout}
              >
                退出
              </button>
            </div>
            <MessageList messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}
