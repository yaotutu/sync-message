import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function verifySession(req: NextRequest) {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) {
        return null;
    }

    try {
        // 这里可以添加实际的session验证逻辑
        // 例如：验证JWT token或查询数据库
        return { userId: session };
    } catch (error) {
        return null;
    }
}