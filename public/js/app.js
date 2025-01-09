class App {
    constructor() {
        this.messageList = document.getElementById('messageList');
        this.autoRefresh = new AutoRefresh(() => this.loadMessages());

        this.init();
    }

    init() {
        this.loadMessages();
        this.autoRefresh.start();
    }

    async loadMessages() {
        const messages = await MessageService.getMessages();

        this.messageList.innerHTML = '';

        if (messages.length === 0) {
            this.messageList.innerHTML = '<div class="no-messages">暂无消息</div>';
            return;
        }

        messages.forEach(msg => {
            this.messageList.appendChild(MessageService.createMessageElement(msg));
        });

        this.autoRefresh.updateNextRefresh();
    }
} 