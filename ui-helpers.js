// UI辅助功能模块
const UIHelpers = (() => {
    // DOM 元素
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    const syncConflictModal = document.getElementById('sync-conflict-modal');
    const closeConflictModal = document.getElementById('close-conflict-modal');
    const keepLocalBtn = document.getElementById('keep-local-btn');
    const restoreCloudBtn = document.getElementById('restore-cloud-btn');

    // 初始化
    function init() {
        setupEventListeners();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 同步冲突处理
        closeConflictModal.addEventListener('click', () => {
            syncConflictModal.classList.add('hidden');
            syncConflictModal.classList.remove('flex');
        });
        
        syncConflictModal.addEventListener('click', (e) => {
            if (e.target === syncConflictModal) {
                syncConflictModal.classList.add('hidden');
                syncConflictModal.classList.remove('flex');
            }
        });

        keepLocalBtn.addEventListener('click', () => {
            // 保留本地数据逻辑
            syncConflictModal.classList.add('hidden');
            syncConflictModal.classList.remove('flex');
            showToast('已保留本地数据');
        });
        
        restoreCloudBtn.addEventListener('click', () => {
            // 使用云端数据逻辑
            syncConflictModal.classList.add('hidden');
            syncConflictModal.classList.remove('flex');
            showToast('已恢复云端数据');
        });
    }

    // 显示提示框
    function showToast(message, type = 'info') {
        toastMessage.textContent = message;
        
        // 设置图标
        switch(type) {
            case 'success':
                toastIcon.className = 'fa fa-check-circle';
                toast.classList.remove('bg-dark', 'bg-red-600');
                toast.classList.add('bg-green-600');
                break;
            case 'error':
                toastIcon.className = 'fa fa-exclamation-circle';
                toast.classList.remove('bg-dark', 'bg-green-600');
                toast.classList.add('bg-red-600');
                break;
            case 'warning':
                toastIcon.className = 'fa fa-exclamation-triangle';
                toast.classList.remove('bg-dark', 'bg-green-600', 'bg-red-600');
                toast.classList.add('bg-yellow-600');
                break;
            default:
                toastIcon.className = 'fa fa-info-circle';
                toast.classList.remove('bg-green-600', 'bg-red-600', 'bg-yellow-600');
                toast.classList.add('bg-dark');
        }
        
        // 显示提示框
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
        
        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    // 显示同步冲突模态框
    function showSyncConflictModal() {
        syncConflictModal.classList.remove('hidden');
        syncConflictModal.classList.add('flex');
    }

    // 辅助函数：获取显示文本
    function getShadowText(value) {
        switch(value) {
            case 'none': return '无';
            case 'light': return '轻微';
            case 'medium': return '中等';
            case 'strong': return '强烈';
            default: return '';
        }
    }

    function getRadiusText(value) {
        switch(value) {
            case 'sm': return '小';
            case 'md': return '中等';
            case 'lg': return '大';
            default: return '';
        }
    }

    function getSpacingText(value) {
        switch(value) {
            case 'tight': return '紧凑';
            case 'normal': return '适中';
            case 'loose': return '宽松';
            default: return '';
        }
    }

    function getNavbarStyleText(value) {
        switch(value) {
            case 'standard': return '标准';
            case 'minimal': return '简约';
            case 'compact': return '紧凑';
            default: return '';
        }
    }

    function getIconSizeText(value) {
        switch(value) {
            case 'small': return '小';
            case 'medium': return '中等';
            case 'large': return '大';
            default: return '';
        }
    }

    return {
        init,
        showToast,
        showSyncConflictModal,
        getShadowText,
        getRadiusText,
        getSpacingText,
        getNavbarStyleText,
        getIconSizeText
    };
})();
