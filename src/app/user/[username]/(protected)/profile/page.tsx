'use client';

import React from 'react';
import { use } from 'react';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { username } = use(params);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Hello World - {username}</h1>
        </div>
    );
} 