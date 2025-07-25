// 同步管理模块
const SyncManager = (() => {
    // DOM 元素
    const syncBtn = document.getElementById('sync-btn');
    const manualSyncBtn = document.getElementById('manual-sync-btn');
    const lastSyncTime = document.getElementById('last-sync-time');
    
    // 自动同步计时器
    let autoSyncTimer = null;

    // 初始化
    function init() {
        setupEventListeners();
        setupAutoSync();
        loadLastSyncTime();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 同步按钮
        syncBtn.addEventListener('click', syncData);
        manualSyncBtn.addEventListener('click', syncData);
    }

    // 数据同步
    function syncData() {
        // 显示同步中状态
        const originalIcon = syncBtn.innerHTML;
        syncBtn.innerHTML = '<i class="fa fa-spinner sync-spinner text-gray-600"></i>';
        syncBtn.disabled = true;
        manualSyncBtn.disabled = true;
        
        // 模拟同步过程
        setTimeout(() => {
            const settings = AppSettings.getSettings();
            
            // 随机决定是否有冲突
            const hasConflict = Math.random() > 0.7;
            
            if (hasConflict) {
                // 显示冲突模态框
                UIHelpers.showSyncConflictModal();
            } else {
                // 同步成功
                const now = new Date();
                lastSyncTime.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
                
                if (settings.syncNotifications) {
                    UIHelpers.showToast('数据同步成功', 'success');
                }
                
                // 保存最后同步时间
                localStorage.setItem('lastSyncTime', new Date().toISOString());
            }
            
            // 恢复按钮状态
            syncBtn.innerHTML = originalIcon;
            syncBtn.disabled = false;
            manualSyncBtn.disabled = false;
        }, 1500);
    }

    // 自动同步设置
    function setupAutoSync() {
        // 清除现有定时器
        if (autoSyncTimer) {
            clearInterval(autoSyncTimer);
            autoSyncTimer = null;
        }
        
        // 获取当前设置
        const settings = AppSettings.getSettings();
        
        // 如果启用了自动同步，设置新的定时器
        if (settings.autoSync) {
            // 间隔时间（分钟转毫秒）
            const intervalMs = settings.syncInterval * 60 * 1000;
            autoSyncTimer = setInterval(syncData, intervalMs);
        }
    }

    // 加载最后同步时间
    function loadLastSyncTime() {
        const lastSync = localStorage.getItem('lastSyncTime');
        if (lastSync) {
            const lastSyncDate = new Date(lastSync);
            lastSyncTime.textContent = `${lastSyncDate.toLocaleDateString()} ${lastSyncDate.toLocaleTimeString()}`;
        }
    }

    return {
        init,
        syncData,
        setupAutoSync
    };
})();
