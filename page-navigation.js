// 页面导航管理模块
const PageNavigation = (() => {
    // DOM 元素
    const cardsView = document.getElementById('cards-view');
    const iframeView = document.getElementById('iframe-view');
    const settingsView = document.getElementById('settings-view');
    const contentIframe = document.getElementById('content-iframe');
    const currentPageTitle = document.getElementById('current-page-title');
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const homeBtn = document.getElementById('home-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const closeIframe = document.getElementById('close-iframe');
    const loadPageBtns = document.querySelectorAll('.load-page-btn');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const settingsTabs = document.querySelectorAll('.settings-tab');

    // 历史记录管理
    const historyStack = [];
    let historyIndex = -1;

    // 初始化
    function init() {
        setupEventListeners();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 页面卡片点击事件
        loadPageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageUrl = e.currentTarget.getAttribute('data-page');
                const pageTitle = e.currentTarget.getAttribute('data-title');
                loadPage(pageUrl, pageTitle);
            });
        });

        // 关闭iframe
        closeIframe.addEventListener('click', showCardsView);

        // 导航按钮
        backBtn.addEventListener('click', goBack);
        forwardBtn.addEventListener('click', goForward);
        refreshBtn.addEventListener('click', refreshPage);
        homeBtn.addEventListener('click', showCardsView);

        // 设置按钮
        settingsBtn.addEventListener('click', showSettingsView);

        // 设置标签切换
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                switchSettingsTab(tabId);
            });
        });

        // 初始默认选中第一个设置标签
        switchSettingsTab('page-management');
    }

    // 加载页面
    function loadPage(url, title) {
        contentIframe.src = url;
        currentPageTitle.textContent = title;
        
        // 更新历史记录
        if (historyIndex < historyStack.length - 1) {
            historyStack.splice(historyIndex + 1);
        }
        historyStack.push({ url, title });
        historyIndex = historyStack.length - 1;
        updateHistoryButtons();
        
        // 显示iframe视图
        cardsView.classList.add('hidden');
        settingsView.classList.add('hidden');
        iframeView.classList.remove('hidden');
    }

    // 显示卡片视图
    function showCardsView() {
        iframeView.classList.add('hidden');
        settingsView.classList.add('hidden');
        cardsView.classList.remove('hidden');
    }

    // 显示设置视图
    function showSettingsView() {
        cardsView.classList.add('hidden');
        iframeView.classList.add('hidden');
        settingsView.classList.remove('hidden');
    }

    // 切换设置标签
    function switchSettingsTab(tabId) {
        // 更新侧边栏选中状态
        sidebarItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 更新内容区域显示
        settingsTabs.forEach(tab => {
            if (tab.id === `${tabId}-tab`) {
                tab.classList.remove('hidden');
                tab.classList.add('active');
            } else {
                tab.classList.add('hidden');
                tab.classList.remove('active');
            }
        });
    }

    // 历史记录导航
    function goBack() {
        if (historyIndex > 0) {
            historyIndex--;
            const { url, title } = historyStack[historyIndex];
            contentIframe.src = url;
            currentPageTitle.textContent = title;
            updateHistoryButtons();
        }
    }

    function goForward() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            const { url, title } = historyStack[historyIndex];
            contentIframe.src = url;
            currentPageTitle.textContent = title;
            updateHistoryButtons();
        }
    }

    function refreshPage() {
        if (!iframeView.classList.contains('hidden')) {
            contentIframe.src = contentIframe.src;
        }
    }

    function updateHistoryButtons() {
        backBtn.disabled = historyIndex <= 0;
        forwardBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    return {
        init,
        loadPage,
        showCardsView,
        showSettingsView
    };
})();
