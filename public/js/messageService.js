class MessageService {
    static async getMessages() {
        try {
            const response = await fetch('/api/messages');
            return await response.json();
        } catch (error) {
            console.error('加载消息失败:', error);
            return [];
        }
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    }

    static createMessageElement(msg) {
        const li = document.createElement('li');
        li.className = 'message-item';
        li.innerHTML = `
            <div class="message-content">${msg.message}</div>
            <div class="message-meta">
                发送者: ${msg.sender}<br>
                发送时间: ${this.formatDate(msg.timestamp)}<br>
                接收时间: ${this.formatDate(msg.receivedAt)}
            </div>
        `;
        return li;
    }
} 