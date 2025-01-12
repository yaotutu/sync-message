'use client';

import { useState, useEffect } from 'react';

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
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <span className="font-mono text-sm">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
    );
} 