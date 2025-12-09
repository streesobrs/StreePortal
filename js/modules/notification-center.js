// 通知中心管理模块
const NotificationCenter = (() => {
    // 存储通知列表
    let notifications = [];
    const STORAGE_KEY = 'notificationHistory';
    const MAX_NOTIFICATIONS = 50; // 最大通知数量

    // DOM 元素
    let notificationCenterElement = null;
    let notificationListElement = null;
    let notificationButton = null;

    // 初始化
    function init() {
        loadFromStorage();
        createNotificationButton();
        createNotificationCenter();
        setupEventListeners();
        updateNotificationBadge();
    }

    // 从本地存储加载通知历史
    function loadFromStorage() {
        const savedNotifications = localStorage.getItem(STORAGE_KEY);
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
        }
    }

    // 保存通知历史到本地存储
    function saveToStorage() {
        // 只保存最新的MAX_NOTIFICATIONS条通知
        const notificationsToSave = notifications.slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationsToSave));
    }

    // 创建通知按钮
    function createNotificationButton() {
        // 检查是否已有通知按钮
        notificationButton = document.getElementById('notification-button');
        if (notificationButton) {
            return;
        }

        // 创建通知按钮
        notificationButton = document.createElement('button');
        notificationButton.id = 'notification-button';
        // 与其他导航栏按钮保持一致的样式：添加背景色，使用相同的过渡效果
        notificationButton.className = 'relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 focus:outline-none';
        notificationButton.innerHTML = `
            <i class="fa fa-bell"></i>
            <span id="notification-badge" class="absolute top-1 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center hidden shadow-sm">0</span>
        `;
        notificationButton.title = '通知中心';

        // 直接添加到导航栏的控制按钮组中，集成到现有UI
        const navControls = document.querySelector('.flex.items-center.gap-2');
        if (navControls) {
            // 找到设置按钮前的位置插入通知按钮
            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn && settingsBtn.parentNode === navControls) {
                navControls.insertBefore(notificationButton, settingsBtn);
            } else {
                // 如果找不到设置按钮，直接添加到控制组末尾
                navControls.appendChild(notificationButton);
            }
        } else {
            // 如果找不到导航控制组，添加到导航栏中
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.appendChild(notificationButton);
            } else {
                // 最后才添加到body中
                document.body.appendChild(notificationButton);
            }
        }
    }

    // 创建通知中心面板
    function createNotificationCenter() {
        // 创建通知中心容器
        notificationCenterElement = document.createElement('div');
        notificationCenterElement.id = 'notification-center';
        // 调整为与整体UI风格一致的样式
        notificationCenterElement.className = 'absolute top-full right-0 mt-1 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-lg shadow-md z-[1000] hidden overflow-hidden border border-gray-200 dark:border-gray-700 transform origin-top-right transition-all duration-200 scale-95 opacity-0'

        // 通知中心头部
        const header = document.createElement('div');
        header.className = 'p-3 border-b border-gray-200 dark:border-gray-700';
        header.innerHTML = `
            <div class="flex items-center justify-between">
                <h3 class="text-base font-medium text-gray-800 dark:text-white">通知中心</h3>
                <button id="clear-notifications-btn" class="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                    清空所有
                </button>
            </div>
        `;

        // 通知列表容器
        const notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'max-h-96 overflow-y-auto custom-scrollbar';

        // 通知列表
        notificationListElement = document.createElement('div');
        notificationListElement.id = 'notification-list';
        notificationListElement.className = 'divide-y divide-gray-200 dark:divide-gray-700';

        notificationsContainer.appendChild(notificationListElement);
        notificationCenterElement.appendChild(header);
        notificationCenterElement.appendChild(notificationsContainer);

        // 将通知中心添加为通知按钮的子元素，使其从导航栏中弹出
        if (notificationButton) {
            // 确保通知按钮有相对定位
            notificationButton.style.position = 'relative';
            notificationButton.appendChild(notificationCenterElement);
        } else {
            // 如果按钮不存在，仍然添加到body中
            document.body.appendChild(notificationCenterElement);
        }
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 通知按钮点击事件
        notificationButton.addEventListener('click', toggleNotificationCenter);

        // 清空通知按钮点击事件
        document.getElementById('clear-notifications-btn').addEventListener('click', clearAllNotifications);

        // 点击页面其他地方关闭通知中心
        document.addEventListener('click', (e) => {
            if (!notificationCenterElement.contains(e.target) && e.target !== notificationButton && !notificationButton.contains(e.target)) {
                hideNotificationCenter();
            }
        });

        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideNotificationCenter();
            }
        });
    }

    // 切换通知中心显示/隐藏
    function toggleNotificationCenter() {
        const isHidden = notificationCenterElement.classList.contains('hidden');

        if (isHidden) {
            showNotificationCenter();
        } else {
            hideNotificationCenter();
        }
    }

    // 隐藏通知中心
    function hideNotificationCenter() {
        // 添加动画效果
        notificationCenterElement.style.transform = 'scale(0.95)';
        notificationCenterElement.style.opacity = '0';

        // 动画完成后隐藏
        setTimeout(() => {
            notificationCenterElement.classList.add('hidden');
        }, 200);
    }

    // 显示通知中心
    function showNotificationCenter() {
        notificationCenterElement.classList.remove('hidden');

        // 强制重排以触发动画
        void notificationCenterElement.offsetWidth;

        // 添加动画效果
        notificationCenterElement.style.transform = 'scale(1)';
        notificationCenterElement.style.opacity = '1';

        renderNotifications();
        // 标记所有通知为已读
        markAllAsRead();
    }

    // 渲染通知列表
    function renderNotifications() {
        if (!notificationListElement) return;

        notificationListElement.innerHTML = '';

        if (notifications.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'p-6 text-center text-gray-500 dark:text-gray-400';
            emptyMessage.textContent = '暂无通知';
            notificationListElement.appendChild(emptyMessage);
        } else {
            // 按时间戳排序，最新的通知排在前面
            const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

            sortedNotifications.forEach(notification => {
                const notificationItem = createNotificationItem(notification);
                notificationListElement.appendChild(notificationItem);
            });
        }
    }

    // 创建单个通知项
    function createNotificationItem(notification) {
        const item = document.createElement('div');

        // 根据通知类型和是否已读设置样式
        let bgColorClass = notification.read ? '' : 'bg-gray-50 dark:bg-gray-750';
        let iconColorClass;

        switch (notification.type) {
            case 'success':
                iconColorClass = 'text-green-500 dark:text-green-400';
                break;
            case 'error':
                iconColorClass = 'text-red-500 dark:text-red-400';
                break;
            case 'warning':
                iconColorClass = 'text-yellow-500 dark:text-yellow-400';
                break;
            default: // info
                iconColorClass = 'text-blue-500 dark:text-blue-400';
        }

        item.className = `p-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${bgColorClass}`;

        // 获取通知图标
        let iconName;
        switch (notification.type) {
            case 'success':
                iconName = 'check';
                break;
            case 'error':
                iconName = 'times';
                break;
            case 'warning':
                iconName = 'exclamation';
                break;
            default: // info
                iconName = 'info';
        }

        item.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 mr-3 mt-0.5">
                    <i class="fa fa-${iconName} ${iconColorClass}"></i>
                </div>
                <div class="flex-grow min-w-0">
                    <p class="text-sm text-gray-700 dark:text-gray-300 break-words">${notification.message}</p>
                    <div class="mt-1 flex items-center justify-between">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${formatRelativeTime(notification.timestamp)}</span>
                        <button class="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors delete-notification" data-id="${notification.id}">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加删除按钮事件
        const deleteButton = item.querySelector('.delete-notification');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
        });

        return item;
    }

    // 添加通知
    function addNotification(message, type = 'info') {
        const notification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: Date.now(),
            read: false
        };

        // 添加到通知列表开头
        notifications.unshift(notification);

        // 保存到存储
        saveToStorage();

        // 更新UI
        updateNotificationBadge();

        // 不再调用UIHelpers.showToast以避免无限递归
        // 注意：UIHelpers.showToast已被enhanceToastMethod增强，会调用addNotification

        return notification.id;
    }

    // 删除单个通知
    function deleteNotification(id) {
        const index = notifications.findIndex(notification => notification.id === id);
        if (index > -1) {
            notifications.splice(index, 1);
            saveToStorage();
            renderNotifications();
            updateNotificationBadge();
        }
    }

    // 清空所有通知
    function clearAllNotifications() {
        if (confirm('确定要清空所有通知吗？')) {
            notifications = [];
            saveToStorage();
            renderNotifications();
            updateNotificationBadge();
        }
    }

    // 标记所有通知为已读
    function markAllAsRead() {
        notifications.forEach(notification => {
            notification.read = true;
        });
        saveToStorage();
        updateNotificationBadge();
    }

    // 更新通知角标
    function updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        const unreadCount = notifications.filter(notification => !notification.read).length;

        if (unreadCount > 0) {
            // 对于数量过多的通知，显示为9+以保持徽章尺寸
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // 格式化相对时间
    function formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;

        if (diff < minute) {
            return '刚刚';
        } else if (diff < hour) {
            const minutes = Math.floor(diff / minute);
            return `${minutes}分钟前`;
        } else if (diff < day) {
            const hours = Math.floor(diff / hour);
            return `${hours}小时前`;
        } else if (diff < week) {
            const days = Math.floor(diff / day);
            return `${days}天前`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString('zh-CN');
        }
    }

    // 修改UIHelpers.showToast方法，使其同时添加通知到通知中心
    function enhanceToastMethod() {
        if (UIHelpers && UIHelpers.showToast) {
            const originalToastMethod = UIHelpers.showToast;

            UIHelpers.showToast = function (message, type = 'info') {
                // 调用原始方法显示toast
                originalToastMethod.call(UIHelpers, message, type);

                // 添加到通知中心
                addNotification(message, type);
            };
        }
    }

    // 导出方法
    return {
        init,
        addNotification,
        deleteNotification,
        clearAllNotifications,
        showNotificationCenter,
        hideNotificationCenter,
        enhanceToastMethod
    };
})();