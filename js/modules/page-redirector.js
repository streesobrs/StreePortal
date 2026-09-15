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

        // 只有当页面是子页面（/pages/ 或 pages/ 开头）且不是在iframe中加载时，才执行重定向
        const normalizedPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
        if (normalizedPath.includes('/pages/') && normalizedPath.endsWith('.html') && !isInIframe()) {
            // 构建重定向URL - 保留当前路径的前缀（如 StreePortal/），相对重定向回 index
            // 用相对路径 './' 让浏览器基于当前目录（xxx/pages/）跳回到上级
            console.log('检测到直接访问子页面，重定向到应用框架:', normalizedPath);
            window.location.href = './index.html';
        }
    }

    return {
        init
    };
})();

// 页面加载完成后执行重定向检查
document.addEventListener('DOMContentLoaded', PageRedirector.init);