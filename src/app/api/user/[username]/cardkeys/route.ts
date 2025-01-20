import { addCardKey, deleteCardKey, getUserCardKeys, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// GET 获取用户卡密列表
export async function GET(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const authUsername = req.headers.get('x-username');
        const authPassword = req.headers.get('x-password');

        if (!authUsername || !authPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' });
        }

        // 验证用户
        const validationResult = await validateUser(authUsername, authPassword);
        if (!validationResult.success) {
            return NextResponse.json({ success: false, message: '无效的用户名或密码' });
        }

        // 获取卡密列表
        const result = await getUserCardKeys(username);

        // 计算剩余时间
        const now = new Date();
        const cardKeys = result.data.map(key => {
            if (key.used && key.usedAt) {
                const expireTime = new Date(key.usedAt.getTime() + 3 * 60 * 1000); // 3分钟后过期
                if (now < expireTime) {
                    return {
                        ...key,
                        expiresIn: expireTime.getTime() - now.getTime()
                    };
                }
            }
            return key;
        });

        return NextResponse.json({ success: true, data: cardKeys });
    } catch (error) {
        console.error('获取用户卡密列表失败:', error);
        return NextResponse.json({ success: false, message: '获取用户卡密列表失败' });
    }
}

// 生成新卡密
export async function POST(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const count = Number(req.nextUrl.searchParams.get('count')) || 1;

        // 验证用户权限
        const authUsername = req.headers.get('x-username');
        const authPassword = req.headers.get('x-password');

        if (!authUsername || !authPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' });
        }

        // 验证用户
        const validationResult = await validateUser(authUsername, authPassword);
        if (!validationResult.success) {
            return NextResponse.json({ success: false, message: '无效的用户名或密码' });
        }

        // 创建卡密
        const result = await addCardKey(username, count);
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加卡密失败:', error);
        return NextResponse.json({ success: false, message: '添加卡密失败' });
    }
}

// 删除卡密
export async function DELETE(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const { id } = await req.json();
        const result = await deleteCardKey(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除卡密失败:', error);
        return NextResponse.json({ success: false, message: '删除卡密失败' });
    }
} 