class AutoRefresh {
    constructor(onRefresh) {
        this.refreshTimer = null;
        this.countdownTimer = null;
        this.nextRefresh = 0;
        this.onRefresh = onRefresh;

        this.init();
    }

    init() {
        this.autoRefreshCheckbox = document.getElementById('autoRefresh');
        this.refreshIntervalSelect = document.getElementById('refreshInterval');
        this.countdownElement = document.getElementById('countdown');

        this.autoRefreshCheckbox.addEventListener('change', () => this.start());
        this.refreshIntervalSelect.addEventListener('change', () => this.start());
    }

    updateCountdown() {
        const now = Date.now();
        const remaining = Math.max(0, this.nextRefresh - now);
        const seconds = Math.ceil(remaining / 1000);
        this.countdownElement.textContent =
            seconds > 0 ? `${seconds}秒后刷新` : '';
    }

    start() {
        this.stop();

        if (this.autoRefreshCheckbox.checked) {
            const interval = parseInt(this.refreshIntervalSelect.value);
            this.refreshTimer = setInterval(() => this.onRefresh(), interval);
            this.countdownTimer = setInterval(() => this.updateCountdown(), 1000);
            this.nextRefresh = Date.now() + interval;
            this.updateCountdown();
        }
    }

    stop() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownElement.textContent = '';
    }

    updateNextRefresh() {
        if (this.autoRefreshCheckbox.checked) {
            this.nextRefresh = Date.now() + parseInt(this.refreshIntervalSelect.value);
        }
    }
} 