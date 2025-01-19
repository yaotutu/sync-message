'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
    expiresIn: number;
    onExpire: () => void;
}

export default function Countdown({ expiresIn, onExpire }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState(expiresIn);

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    onExpire();
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-gray-600 dark:text-gray-400">
            剩余时间：{minutes}分{seconds}秒
        </div>
    );
} 