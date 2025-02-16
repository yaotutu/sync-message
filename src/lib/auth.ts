import { SignJWT, jwtVerify } from 'jose';

// 使用应用名称作为密钥，至少比默认值要好
const JWT_SECRET = 'sync-message-system-key-123';

interface TokenData {
    username: string;
    exp: number;
}

export async function signToken(username: string): Promise<string> {
    return new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyToken(token: string): Promise<TokenData> {
    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );

        if (!payload.username) {
            throw new Error('无效的 token 格式');
        }

        return {
            username: payload.username as string,
            exp: payload.exp as number
        };
    } catch (error) {
        throw new Error('无效的 token');
    }
} 