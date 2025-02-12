'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthStatus, AuthActions } from '@/lib/hooks/useAuth';

interface AuthContextValue extends AuthStatus, AuthActions { }

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext必须在AuthProvider内部使用');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
    username: string;
}

export const AuthProvider = ({ children, username }: AuthProviderProps) => {
    const auth = useAuth(username);

    return (
        <AuthContext.Provider value={auth}>
            {auth.loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return function WithAuthComponent(props: P) {
        const auth = useAuthContext();

        if (auth.loading) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
            );
        }

        if (!auth.isAuthenticated) {
            window.location.href = '/login';
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};