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
                if (prev <= 1000) {
                    clearInterval(timer);
                    onExpire();
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
        <span className="text-gray-600 text-sm">
            剩余时间: {minutes}分{seconds}秒
        </span>
    );
} 