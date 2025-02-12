export function copyToClipboard(text: string): boolean {
    try {
        // 创建一个临时的 textarea 元素
        const textarea = document.createElement('textarea');
        textarea.value = text;

        // 将 textarea 添加到文档中
        document.body.appendChild(textarea);

        // 选中文本
        textarea.select();
        textarea.setSelectionRange(0, 99999); // 兼容移动设备

        // 执行复制命令
        document.execCommand('copy');

        // 移除临时元素
        document.body.removeChild(textarea);

        return true;
    } catch (err) {
        console.error('复制失败:', err);
        return false;
    }
} 