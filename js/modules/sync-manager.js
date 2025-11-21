// 同步管理模块
const SyncManager = (() => {
    // DOM 元素
    const syncBtn = document.getElementById('sync-btn');
    const manualSyncBtn = document.getElementById('manual-sync-btn');
    const lastSyncTime = document.getElementById('last-sync-time');

    // 初始化
    function init() {
        setupEventListeners();
        // 不执行自动同步
        // setupAutoSync();
        loadLastSyncTime();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 同步按钮
        syncBtn.addEventListener('click', showNotImplementedMessage);
        if (manualSyncBtn) {
            manualSyncBtn.addEventListener('click', showNotImplementedMessage);
        }
    }

    // 显示未实现提示
    function showNotImplementedMessage() {
        // 显示未实现提示
        UIHelpers.showToast('云服务同步功能尚未实现', 'info');
    }

    // 自动同步设置（已禁用）
    function setupAutoSync() {
        // 自动同步功能已禁用
    }

    // 加载最后同步时间
    function loadLastSyncTime() {
        if (lastSyncTime) {
            lastSyncTime.textContent = '未实现';
        }
    }

    return {
        init,
        showNotImplementedMessage: showNotImplementedMessage
    };
})();
