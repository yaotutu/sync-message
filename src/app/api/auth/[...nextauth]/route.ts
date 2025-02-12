import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { validateAdminPassword } from '@/lib/server/db';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.password) {
                    throw new Error('请输入密码');
                }

                const isValid = await validateAdminPassword(credentials.password);
                if (isValid) {
                    return { id: '1', role: 'admin' };
                }
                throw new Error('密码错误');
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.sub as string;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST }; 