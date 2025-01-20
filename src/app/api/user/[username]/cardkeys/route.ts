import { addCardKey, deleteCardKey, getUserCardKeys } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取卡密列表
export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    try {
        const result = await getUserCardKeys(params.username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户卡密失败:', error);
        return NextResponse.json({ success: false, message: '获取用户卡密失败' });
    }
}

// 生成新卡密
export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
    try {
        const result = await addCardKey(params.username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加卡密失败:', error);
        return NextResponse.json({ success: false, message: '添加卡密失败' });
    }
}

// 删除卡密
export async function DELETE(req: NextRequest, { params }: { params: { username: string } }) {
    try {
        const { id } = await req.json();
        const result = await deleteCardKey(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除卡密失败:', error);
        return NextResponse.json({ success: false, message: '删除卡密失败' });
    }
} 