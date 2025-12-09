// 应用主入口
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各模块
    AppSettings.init();
    PageNavigation.init();
    UIHelpers.init();
    SyncManager.init();
    FavoritesManager.init();
    NotificationCenter.init();
    PageSearch.init();

    // 增强Toast方法，使其同时添加通知到通知中心
    NotificationCenter.enhanceToastMethod();

    // 设置页面搜索的键盘快捷键
    PageSearch.setupKeyboardShortcuts();

    // 应用初始设置
    AppSettings.applySettings();

    // 显示欢迎通知
    NotificationCenter.addNotification('欢迎使用StreePortal！您现在可以收藏常用页面、查看通知历史和搜索页面了。按 Ctrl+K 快速搜索。', 'success');
});
