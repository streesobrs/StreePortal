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

        // 路由处理：检查当前URL是否为子页面
        handleInitialRoute();
    }

    // 处理初始路由
    function handleInitialRoute() {
        const currentPath = window.location.pathname;

        // 检查URL查询参数中是否有page参数（来自子页面重定向）
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');

        // 优先处理查询参数中的页面路径
        if (pageParam && pageParam.includes('/pages/') && pageParam.endsWith('.html')) {
            const pageUrl = pageParam;
            const filename = pageUrl.split('/').pop().replace('.html', '');
            const pageTitle = decodeURIComponent(filename);

            console.log('从URL参数检测到子页面请求:', pageUrl);
            loadPage(pageUrl, pageTitle);

            // 更新URL，移除查询参数，保持URL干净
            window.history.replaceState({}, pageTitle, pageUrl);
        }
        // 如果直接访问的是子页面URL（在应用框架的上下文中）
        else if (currentPath !== '/' && currentPath.includes('/pages/') && currentPath.endsWith('.html')) {
            const pageUrl = currentPath;
            const filename = pageUrl.split('/').pop().replace('.html', '');
            const pageTitle = decodeURIComponent(filename);

            console.log('检测到直接访问子页面URL，将在框架内加载:', pageUrl);
            loadPage(pageUrl, pageTitle);
        }
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

        // 更新浏览器URL而不刷新页面
        // 确保URL是相对路径格式
        const pagePath = url.startsWith('/') ? url : `/${url}`;
        window.history.pushState({ page: url, title: title }, title, pagePath);

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

        // 更新浏览器URL为根路径
        window.history.pushState({}, 'StreePortal 主页', '/');
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

            // 更新浏览器URL
            const pagePath = url.startsWith('/') ? url : `/${url}`;
            window.history.pushState({ page: url, title: title }, title, pagePath);
        }
    }

    function goForward() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            const { url, title } = historyStack[historyIndex];
            contentIframe.src = url;
            currentPageTitle.textContent = title;
            updateHistoryButtons();

            // 更新浏览器URL
            const pagePath = url.startsWith('/') ? url : `/${url}`;
            window.history.pushState({ page: url, title: title }, title, pagePath);
        }
    }

    function refreshPage() {
        if (!iframeView.classList.contains('hidden')) {
            // 添加时间戳参数以确保清除缓存刷新
            const currentUrl = contentIframe.src.split('?')[0];
            const timestamp = new Date().getTime();
            contentIframe.src = `${currentUrl}?t=${timestamp}`;

            // 显示刷新成功的提示
            UIHelpers.showToast('页面已刷新并清除缓存', 'success');
        } else {
            // 简化主页面刷新逻辑，直接执行刷新
            // 不依赖toast显示，确保刷新操作一定执行
            console.log('执行整站刷新');
            // 使用更可靠的方法刷新页面
            const url = window.location.href.split('?')[0];
            window.location.href = `${url}?t=${new Date().getTime()}`;
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
