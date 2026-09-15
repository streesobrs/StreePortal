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

    // ====== 路径工具函数 ======
    // 核心问题：GitHub Pages 项目地址形如 https://xxx.github.io/StreePortal/
    // pushState 如果用裸相对路径会被浏览器按"当前目录"解析，导致 pages/pages 重复
    // 如果用根绝对路径 /pages/xxx.html 又会脱离 /StreePortal/ 前缀导致 404
    // 因此统一策略：pushState 始终用"带项目前缀的完整绝对路径"

    // 从当前 URL 提取项目根路径（如 /StreePortal/ 或 /）
    function getProjectRoot() {
        const pathname = window.location.pathname;

        // 情况1: 当前在子页面  /StreePortal/pages/qrcode.html
        if (pathname.includes('/pages/')) {
            const idx = pathname.indexOf('/pages/');
            return pathname.slice(0, idx) + '/';  // /StreePortal/
        }

        // 情况2: 当前在主页  /StreePortal/ 或 /StreePortal/index.html
        // 去掉可能的文件名
        let root = pathname.replace(/index\.html$/i, '').split('?')[0].split('#')[0];
        if (!root.endsWith('/')) root += '/';
        return root;  // /StreePortal/
    }

    // 将 iframe 用的相对路径（pages/xxx.html）转成 pushState 用的完整路径（/StreePortal/pages/xxx.html）
    function buildPushStateUrl(relativePath) {
        const projectRoot = getProjectRoot();
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        return projectRoot + cleanPath;
    }

    // ====== 生命周期 ======

    // 初始化
    function init() {
        setupEventListeners();
        handleInitialRoute();
    }

    // 处理初始路由
    function handleInitialRoute() {
        const pathname = window.location.pathname;

        // 情况A: 带 ?page=xxx 查询参数（旧的子页面重定向方式）
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');

        if (pageParam && pageParam.includes('/pages/') && pageParam.endsWith('.html')) {
            // 从 pages/ 截取，得到相对路径
            const pagesIdx = pageParam.indexOf('pages/');
            const pageUrl = pagesIdx >= 0 ? pageParam.slice(pagesIdx) : pageParam;
            const filename = pageUrl.split('/').pop().replace('.html', '');
            const pageTitle = decodeURIComponent(filename);

            console.log('[路由] URL参数携带子页面:', pageUrl);
            loadPage(pageUrl, pageTitle);

            // 规范化浏览器地址为干净的完整路径
            window.history.replaceState(
                {}, pageTitle,
                buildPushStateUrl(pageUrl)
            );
            return;
        }

        // 情况B: 直接访问子页面URL（浏览器地址是 /StreePortal/pages/qrcode.html）
        if (pathname.includes('/pages/') && pathname.endsWith('.html')) {
            // 从完整路径中截取 pages/xxx.html 这一段（iframe 需要的相对路径）
            const pagesIdx = pathname.indexOf('/pages/');
            const pageUrl = pathname.slice(pagesIdx + 1);  // pages/qrcode.html
            const filename = pageUrl.split('/').pop().replace('.html', '');
            const pageTitle = decodeURIComponent(filename);

            console.log('[路由] 直接访问子页面URL:', pageUrl);
            loadPage(pageUrl, pageTitle);
        }
    }

    // 设置事件监听器
    function setupEventListeners() {
        loadPageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageUrl = e.currentTarget.getAttribute('data-page');
                const pageTitle = e.currentTarget.getAttribute('data-title');
                loadPage(pageUrl, pageTitle);
            });
        });

        closeIframe.addEventListener('click', showCardsView);
        backBtn.addEventListener('click', goBack);
        forwardBtn.addEventListener('click', goForward);
        refreshBtn.addEventListener('click', refreshPage);
        homeBtn.addEventListener('click', showCardsView);
        settingsBtn.addEventListener('click', showSettingsView);

        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                switchSettingsTab(tabId);
            });
        });

        switchSettingsTab('page-management');
    }

    // ====== 核心方法 ======

    // 加载页面（url 是 iframe 用的相对路径，如 pages/qrcode.html）
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

        // 更新浏览器地址栏 —— 关键！用带项目前缀的完整路径
        window.history.pushState(
            { page: url, title: title },
            title,
            buildPushStateUrl(url)
        );

        // 显示 iframe 视图
        cardsView.classList.add('hidden');
        settingsView.classList.add('hidden');
        iframeView.classList.remove('hidden');
    }

    // 显示卡片视图（回到主页）
    function showCardsView() {
        iframeView.classList.add('hidden');
        settingsView.classList.add('hidden');
        cardsView.classList.remove('hidden');

        // 浏览器地址栏恢复为项目根
        window.history.pushState({}, 'StreePortal 主页', getProjectRoot());
    }

    // 显示设置视图
    function showSettingsView() {
        cardsView.classList.add('hidden');
        iframeView.classList.add('hidden');
        settingsView.classList.remove('hidden');
    }

    // 切换设置标签
    function switchSettingsTab(tabId) {
        sidebarItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
        });
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

    // 历史导航 —— 始终用 buildPushStateUrl 保证路径正确
    function goBack() {
        if (historyIndex <= 0) return;
        historyIndex--;
        const { url, title } = historyStack[historyIndex];
        contentIframe.src = url;
        currentPageTitle.textContent = title;
        updateHistoryButtons();
        window.history.pushState({ page: url, title: title }, title, buildPushStateUrl(url));
    }

    function goForward() {
        if (historyIndex >= historyStack.length - 1) return;
        historyIndex++;
        const { url, title } = historyStack[historyIndex];
        contentIframe.src = url;
        currentPageTitle.textContent = title;
        updateHistoryButtons();
        window.history.pushState({ page: url, title: title }, title, buildPushStateUrl(url));
    }

    function refreshPage() {
        if (!iframeView.classList.contains('hidden')) {
            const currentUrl = contentIframe.src.split('?')[0];
            const timestamp = new Date().getTime();
            contentIframe.src = `${currentUrl}?t=${timestamp}`;
            UIHelpers.showToast('页面已刷新并清除缓存', 'success');
        } else {
            const url = window.location.href.split('?')[0];
            window.location.href = `${url}?t=${new Date().getTime()}`;
        }
    }

    function updateHistoryButtons() {
        backBtn.disabled = historyIndex <= 0;
        forwardBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    return { init, loadPage, showCardsView, showSettingsView };
})();
