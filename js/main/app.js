// 应用主入口
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个模块
    AppSettings.init();
    PageNavigation.init();
    UIHelpers.init();
    SyncManager.init();

    // 应用初始设置
    AppSettings.applySettings();
});
