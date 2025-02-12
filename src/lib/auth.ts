import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { validateAdminPassword } from '@/lib/server/db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('请输入用户名和密码');
                }

                const isValid = await validateAdminPassword(credentials.username, credentials.password);
                if (isValid) {
                    return { id: '1', role: 'admin', username: credentials.username };
                }
                throw new Error('用户名或密码错误');
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.sub as string;
                session.user.username = token.username as string;
            }
            return session;
        }
    }
}; 