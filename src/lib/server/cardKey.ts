import { customAlphabet } from 'nanoid';

// 使用自定义字符集创建 nanoid 生成器
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

export function generateCardKey(): string {
    return nanoid();
} 