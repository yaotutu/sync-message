import { SignJWT, jwtVerify } from 'jose';
import { TokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'sync-message-jwt-secret-key-2024';

export class JWTService {
    private static instance: JWTService;
    private constructor() { }

    public static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }

    async signToken(payload: Omit<TokenPayload, 'exp'>): Promise<string> {
        try {
            const iat = Math.floor(Date.now() / 1000);
            const exp = iat + 24 * 60 * 60; // 24 hours

            const token = await new SignJWT({ ...payload })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt(iat)
                .setExpirationTime(exp)
                .sign(new TextEncoder().encode(JWT_SECRET));

            return token;
        } catch (error) {
            console.error('JWT 签发失败:', error);
            throw new Error('JWT 签发失败');
        }
    }

    async verifyToken(token: string): Promise<TokenPayload> {
        try {
            const { payload } = await jwtVerify(
                token,
                new TextEncoder().encode(JWT_SECRET)
            );

            if (!this.isValidPayload(payload)) {
                throw new Error('无效的 token 格式');
            }

            return {
                id: payload.id as string,
                username: payload.username as string,
                role: payload.role as 'admin' | 'user',
                exp: payload.exp as number
            };
        } catch (error) {
            console.error('JWT 验证失败:', error);
            throw new Error('无效的 token');
        }
    }

    private isValidPayload(payload: any): payload is TokenPayload {
        return (
            typeof payload.id === 'string' &&
            typeof payload.username === 'string' &&
            (payload.role === 'admin' || payload.role === 'user') &&
            typeof payload.exp === 'number'
        );
    }

    async refreshToken(token: string): Promise<string> {
        const payload = await this.verifyToken(token);
        const { exp, ...rest } = payload;
        return this.signToken(rest);
    }
} 