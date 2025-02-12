'use client';

import { AuthProvider } from '@/components/AuthProvider';
import { use } from 'react';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}

export default function UserLayout({ children, params }: LayoutProps) {
    const { username } = use(params);
    return (
        <AuthProvider username={username}>
            {children}
        </AuthProvider>
    );
}