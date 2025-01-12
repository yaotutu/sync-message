'use client';

import { useState, useEffect, useCallback } from 'react';
import MessageList from '@/components/MessageList';
import Countdown from '@/components/Countdown';
import { Message } from '@/types/message';

export default function HomePage() {
  const [cardKey, setCardKey] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [expiresIn, setExpiresIn] = useState(0);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'x-card-key': cardKey
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [cardKey]);

  const login = async () => {
    try {
      const response = await fetch('/api/cardkey/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: cardKey })
      });

      const result = await response.json();
      if (result.success) {
        setIsLoggedIn(true);
        setUsername(result.username);
        setError('');

        // 处理过期时间
        if (result.expiresIn) {
          setExpiresIn(result.expiresIn);
        } else if (result.firstUsedAt) {
          const now = Date.now();
          const elapsedTime = now - result.firstUsedAt;
          const remainingTime = 3 * 60 * 1000 - elapsedTime; // 3分钟
          if (remainingTime > 0) {
            setExpiresIn(remainingTime);
          } else {
            handleLogout();
            alert('卡密已过期，请重新登录');
            return;
          }
        }

        loadMessages();
      } else {
        if (result.expired) {
          setError('卡密已过期');
        } else {
          setError(result.message || '验证失败');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('登录失败，请稍后重试');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoggedIn) {
      interval = setInterval(loadMessages, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoggedIn, loadMessages]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setMessages([]);
    setCardKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      卡密
                    </label>
                    <input
                      type="text"
                      value={cardKey}
                      onChange={(e) => setCardKey(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="请输入卡密"
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={login}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  >
                    验证
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">欢迎, {username}</h2>
                <Countdown expiresIn={expiresIn} onExpire={handleLogout} />
              </div>
              <MessageList messages={messages} />
              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
