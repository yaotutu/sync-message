import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            username: string;
        };
    }

    interface User {
        id: string;
        role: string;
        username: string;
    }
} 