// 子页面重定向处理模块
const PageRedirector = (() => {
    // 检查是否在iframe中
    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    // 初始化重定向逻辑
    function init() {
        // 获取当前页面的完整URL路径
        const currentPath = window.location.pathname;

        // 只有当页面是子页面（/pages/开头）且不是在iframe中加载时，才执行重定向
        if (currentPath.includes('/pages/') && currentPath.endsWith('.html') && !isInIframe()) {
            // 构建重定向URL - 重定向到主应用，并在URL中保留子页面路径
            const redirectUrl = '/?page=' + encodeURIComponent(currentPath);

            console.log('检测到直接访问子页面，重定向到应用框架:', redirectUrl);
            window.location.href = redirectUrl;
        }
    }

    return {
        init
    };
})();

// 页面加载完成后执行重定向检查
document.addEventListener('DOMContentLoaded', PageRedirector.init);