import { SignJWT, jwtVerify } from 'jose';
import { JWTService } from './auth/jwt';

// 使用应用名称作为密钥，至少比默认值要好
const JWT_SECRET = 'sync-message-system-key-123';

const jwtService = JWTService.getInstance();

export interface TokenData {
    id: string;
    username: string;
    role: 'user' | 'admin';
    exp: number;
}

export async function signToken(payload: Omit<TokenData, 'exp'>): Promise<string> {
    try {
        return await jwtService.signToken(payload);
    } catch (error) {
        console.error('Token 签发失败:', error);
        throw new Error('Token 签发失败');
    }
}

export async function verifyToken(token: string): Promise<TokenData | null> {
    try {
        const payload = await jwtService.verifyToken(token);
        return {
            id: payload.id,
            username: payload.username,
            role: payload.role,
            exp: payload.exp
        };
    } catch (error) {
        console.error('Token 验证失败:', error);
        return null;
    }
} 