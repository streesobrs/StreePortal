// 应用设置管理模块
const AppSettings = (() => {
    // 默认设置
    const defaultSettings = {
        themeMode: 'light',
        primaryColor: '#3B82F6',
        cardLayout: 'grid',
        cardShadow: 'light',
        cardRadius: 'md',
        cardSpacing: 'normal',
        navbarStyle: 'standard',
        enableAnimations: true,
        iconSize: 'medium',
        autoSync: true,
        syncInterval: 30,
        syncNotifications: true
    };

    // 当前设置
    let settings = { ...defaultSettings };

    // DOM 元素
    const themeModeRadios = document.querySelectorAll('input[name="theme-mode"]');
    const colorOptions = document.querySelectorAll('.color-option');
    const primaryColorInput = document.getElementById('primary-color');
    const cardLayoutRadios = document.querySelectorAll('input[name="card-layout"]');
    const cardShadowRadios = document.querySelectorAll('input[name="card-shadow"]');
    const cardRadiusRadios = document.querySelectorAll('input[name="card-radius"]');
    const cardSpacingRadios = document.querySelectorAll('input[name="card-spacing"]');
    const navbarStyleRadios = document.querySelectorAll('input[name="navbar-style"]');
    const enableAnimationsToggle = document.getElementById('enable-animations');
    const iconSizeRadios = document.querySelectorAll('input[name="icon-size"]');
    const autoSyncToggle = document.getElementById('auto-sync');
    const syncIntervalSelect = document.getElementById('sync-interval');
    const syncNotificationsToggle = document.getElementById('sync-notifications');
    const resetAppearanceBtn = document.getElementById('reset-appearance-btn');

    // 初始化
    function init() {
        loadFromLocalStorage();
        updateUIFromSettings();
        setupEventListeners();
    }

    // 从本地存储加载设置
    function loadFromLocalStorage() {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            Object.assign(settings, parsedSettings);
        }
    }

    // 保存设置到本地存储
    function saveToLocalStorage() {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }

    // 根据设置更新UI
    function updateUIFromSettings() {
        // 主题模式
        document.querySelector(`input[name="theme-mode"][value="${settings.themeMode}"]`).checked = true;
        
        // 主色调
        primaryColorInput.value = settings.primaryColor;
        colorOptions.forEach(option => {
            if (option.getAttribute('data-color') === settings.primaryColor) {
                option.classList.remove('border-transparent');
                option.classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'border-primary');
            } else {
                option.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'border-primary');
                option.classList.add('border-transparent');
            }
        });
        
        // 卡片布局
        document.querySelector(`input[name="card-layout"][value="${settings.cardLayout}"]`).checked = true;
        
        // 卡片阴影
        document.querySelector(`input[name="card-shadow"][value="${settings.cardShadow}"]`).checked = true;
        
        // 卡片圆角
        document.querySelector(`input[name="card-radius"][value="${settings.cardRadius}"]`).checked = true;
        
        // 卡片间距
        document.querySelector(`input[name="card-spacing"][value="${settings.cardSpacing}"]`).checked = true;
        
        // 导航栏样式
        document.querySelector(`input[name="navbar-style"][value="${settings.navbarStyle}"]`).checked = true;
        
        // 动画设置
        enableAnimationsToggle.checked = settings.enableAnimations;
        
        // 图标大小
        document.querySelector(`input[name="icon-size"][value="${settings.iconSize}"]`).checked = true;
        
        // 自动同步
        autoSyncToggle.checked = settings.autoSync;
        
        // 同步间隔
        syncIntervalSelect.value = settings.syncInterval;
        
        // 同步通知
        syncNotificationsToggle.checked = settings.syncNotifications;
    }

    // 应用设置到界面
    function applySettings() {
        // 应用主题模式
        if (settings.themeMode === 'dark' || 
            (settings.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // 应用主色调
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        
        // 应用卡片布局
        const pagesContainer = document.getElementById('pages-container');
        if (settings.cardLayout === 'grid') {
            pagesContainer.classList.remove('grid-cols-1');
            pagesContainer.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
        } else {
            pagesContainer.classList.remove('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
            pagesContainer.classList.add('grid-cols-1');
        }
        
        // 应用卡片阴影
        const cards = document.querySelectorAll('.card-hover');
        cards.forEach(card => {
            card.classList.remove('shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl');
            
            switch(settings.cardShadow) {
                case 'none':
                    card.classList.add('shadow-none');
                    break;
                case 'light':
                    card.classList.add('shadow-md');
                    break;
                case 'medium':
                    card.classList.add('shadow-lg');
                    break;
                case 'strong':
                    card.classList.add('shadow-xl');
                    break;
            }
        });
        
        // 应用卡片圆角
        const roundedCards = document.querySelectorAll('.rounded-xl, .preview-card');
        roundedCards.forEach(card => {
            card.classList.remove('rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl');
            
            switch(settings.cardRadius) {
                case 'sm':
                    card.classList.add('rounded-sm');
                    break;
                case 'md':
                    card.classList.add('rounded-md');
                    break;
                case 'lg':
                    card.classList.add('rounded-lg');
                    break;
                default:
                    card.classList.add('rounded-xl');
            }
        });
        
        // 应用卡片间距
        const cardContainers = document.querySelectorAll('#pages-container, #preview-cards-container');
        cardContainers.forEach(container => {
            container.classList.remove('gap-2', 'gap-4', 'gap-6', 'gap-8');
            
            switch(settings.cardSpacing) {
                case 'tight':
                    container.classList.add('gap-2');
                    break;
                case 'normal':
                    container.classList.add('gap-6');
                    break;
                case 'loose':
                    container.classList.add('gap-8');
                    break;
            }
        });
        
        // 应用导航栏样式
        const navbar = document.getElementById('navbar');
        navbar.classList.remove('py-1', 'py-2', 'py-3', 'shadow-none', 'shadow-md');
        
        switch(settings.navbarStyle) {
            case 'minimal':
                navbar.classList.add('py-2', 'shadow-none');
                break;
            case 'compact':
                navbar.classList.add('py-1', 'shadow-md');
                break;
            default:
                navbar.classList.add('py-3', 'shadow-md');
        }
        
        // 应用动画设置
        const animCards = document.querySelectorAll('.card-hover');
        animCards.forEach(card => {
            if (settings.enableAnimations) {
                card.classList.add('transition-all', 'duration-300', 'hover:shadow-xl', 'hover:-translate-y-1');
            } else {
                card.classList.remove('transition-all', 'duration-300', 'hover:shadow-xl', 'hover:-translate-y-1');
            }
        });
        
        // 应用图标大小
        const icons = document.querySelectorAll('.w-12.h-12, #preview-icon-container-1, #preview-icon-container-2');
        icons.forEach(icon => {
            icon.classList.remove('w-8', 'h-8', 'w-12', 'h-12', 'w-16', 'h-16');
            const iconElem = icon.querySelector('i');
            iconElem.classList.remove('text-lg', 'text-xl', 'text-2xl');
            
            switch(settings.iconSize) {
                case 'small':
                    icon.classList.add('w-8', 'h-8');
                    iconElem.classList.add('text-lg');
                    break;
                case 'large':
                    icon.classList.add('w-16', 'h-16');
                    iconElem.classList.add('text-2xl');
                    break;
                default:
                    icon.classList.add('w-12', 'h-12');
                    iconElem.classList.add('text-xl');
            }
        });

        // 更新预览
        updatePreview();
    }

    // 更新预览
    function updatePreview() {
        // 更新预览导航栏
        const previewNavbar = document.getElementById('preview-navbar');
        previewNavbar.classList.remove('py-1', 'py-2', 'py-3', 'shadow-none', 'shadow-md');
        
        switch(settings.navbarStyle) {
            case 'minimal':
                previewNavbar.classList.add('py-2', 'shadow-none');
                break;
            case 'compact':
                previewNavbar.classList.add('py-1', 'shadow-md');
                break;
            default:
                previewNavbar.classList.add('py-3', 'shadow-md');
        }
        
        // 更新预览卡片样式
        const previewCards = document.querySelectorAll('.preview-card');
        previewCards.forEach(card => {
            // 阴影
            card.classList.remove('shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl');
            switch(settings.cardShadow) {
                case 'none':
                    card.classList.add('shadow-none');
                    break;
                case 'light':
                    card.classList.add('shadow-md');
                    break;
                case 'medium':
                    card.classList.add('shadow-lg');
                    break;
                case 'strong':
                    card.classList.add('shadow-xl');
                    break;
            }
            
            // 圆角
            card.classList.remove('rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl');
            switch(settings.cardRadius) {
                case 'sm':
                    card.classList.add('rounded-sm');
                    break;
                case 'md':
                    card.classList.add('rounded-md');
                    break;
                case 'lg':
                    card.classList.add('rounded-lg');
                    break;
                default:
                    card.classList.add('rounded-xl');
            }
            
            // 动画
            if (settings.enableAnimations) {
                card.classList.add('transition-all', 'duration-300', 'hover:shadow-xl', 'hover:-translate-y-1');
            } else {
                card.classList.remove('transition-all', 'duration-300', 'hover:shadow-xl', 'hover:-translate-y-1');
            }
        });
        
        // 更新预览图标
        const previewIcons = document.querySelectorAll('#preview-icon-container-1, #preview-icon-container-2');
        const previewIconElems = document.querySelectorAll('#preview-icon-1, #preview-icon-2');
        
        previewIcons.forEach(icon => {
            icon.classList.remove('w-8', 'h-8', 'w-12', 'h-12', 'w-16', 'h-16', 'bg-primary/10');
            icon.style.backgroundColor = `${settings.primaryColor}33`; // 添加透明度
        });
        
        previewIconElems.forEach(icon => {
            icon.classList.remove('text-lg', 'text-xl', 'text-2xl', 'text-primary');
            icon.style.color = settings.primaryColor;
            
            switch(settings.iconSize) {
                case 'small':
                    previewIcons.forEach(i => i.classList.add('w-8', 'h-8'));
                    icon.classList.add('text-lg');
                    break;
                case 'large':
                    previewIcons.forEach(i => i.classList.add('w-16', 'h-16'));
                    icon.classList.add('text-2xl');
                    break;
                default:
                    previewIcons.forEach(i => i.classList.add('w-12', 'h-12'));
                    icon.classList.add('text-xl');
            }
        });
        
        // 更新预览按钮
        const previewButtons = document.querySelectorAll('#preview-content button');
        previewButtons.forEach(button => {
            button.classList.remove('bg-primary/10', 'text-primary');
            button.style.backgroundColor = `${settings.primaryColor}1A`;
            button.style.color = settings.primaryColor;
        });
        
        // 更新预览卡片间距
        const previewContainer = document.getElementById('preview-cards-container');
        previewContainer.classList.remove('gap-2', 'gap-4', 'gap-6', 'gap-8');
        
        switch(settings.cardSpacing) {
            case 'tight':
                previewContainer.classList.add('gap-2');
                break;
            case 'normal':
                previewContainer.classList.add('gap-6');
                break;
            case 'loose':
                previewContainer.classList.add('gap-8');
                break;
        }
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 主题模式切换
        themeModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.themeMode = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast('主题已更新');
            });
        });

        // 主色调选择
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.currentTarget.getAttribute('data-color');
                settings.primaryColor = color;
                primaryColorInput.value = color;
                
                // 更新选中状态
                colorOptions.forEach(opt => {
                    opt.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'border-primary');
                    opt.classList.add('border-transparent');
                });
                e.currentTarget.classList.remove('border-transparent');
                e.currentTarget.classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'border-primary');
                
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast('主色调已更新');
            });
        });

        // 卡片布局切换
        cardLayoutRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.cardLayout = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`卡片布局已设置为${e.target.value === 'grid' ? '网格' : '列表'}`);
            });
        });

        // 卡片阴影强度
        cardShadowRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.cardShadow = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`卡片阴影已设置为${UIHelpers.getShadowText(e.target.value)}`);
            });
        });

        // 卡片圆角大小
        cardRadiusRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.cardRadius = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`卡片圆角已设置为${UIHelpers.getRadiusText(e.target.value)}`);
            });
        });

        // 卡片间距
        cardSpacingRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.cardSpacing = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`卡片间距已设置为${UIHelpers.getSpacingText(e.target.value)}`);
            });
        });

        // 导航栏样式
        navbarStyleRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.navbarStyle = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`导航栏样式已设置为${UIHelpers.getNavbarStyleText(e.target.value)}`);
            });
        });

        // 动画设置
        enableAnimationsToggle.addEventListener('change', (e) => {
            settings.enableAnimations = e.target.checked;
            saveToLocalStorage();
            applySettings();
            UIHelpers.showToast(`卡片动画已${e.target.checked ? '启用' : '禁用'}`);
        });

        // 卡片图标大小
        iconSizeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settings.iconSize = e.target.value;
                saveToLocalStorage();
                applySettings();
                UIHelpers.showToast(`图标大小已设置为${UIHelpers.getIconSizeText(e.target.value)}`);
            });
        });

        // 自动同步设置
        autoSyncToggle.addEventListener('change', (e) => {
            settings.autoSync = e.target.checked;
            saveToLocalStorage();
            SyncManager.setupAutoSync();
            UIHelpers.showToast(`自动同步已${e.target.checked ? '启用' : '禁用'}`);
        });

        // 同步间隔设置
        syncIntervalSelect.addEventListener('change', (e) => {
            settings.syncInterval = parseInt(e.target.value);
            saveToLocalStorage();
            SyncManager.setupAutoSync();
            UIHelpers.showToast(`同步间隔已设置为${e.target.options[e.target.selectedIndex].text}`);
        });

        // 同步通知设置
        syncNotificationsToggle.addEventListener('change', (e) => {
            settings.syncNotifications = e.target.checked;
            saveToLocalStorage();
            UIHelpers.showToast(`同步通知已${e.target.checked ? '启用' : '禁用'}`);
        });

        // 重置外观设置
        resetAppearanceBtn.addEventListener('click', () => {
            // 保留同步相关设置
            const syncSettings = {
                autoSync: settings.autoSync,
                syncInterval: settings.syncInterval,
                syncNotifications: settings.syncNotifications
            };
            
            // 恢复默认设置
            Object.assign(settings, defaultSettings, syncSettings);
            saveToLocalStorage();
            updateUIFromSettings();
            applySettings();
            UIHelpers.showToast('已重置为默认外观设置');
        });

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (settings.themeMode === 'system') {
                applySettings();
            }
        });
    }

    // 获取当前设置
    function getSettings() {
        return { ...settings };
    }

    return {
        init,
        applySettings,
        getSettings
    };
})();
