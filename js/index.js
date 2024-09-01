// 加载页面内容
function loadPage(page) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', page, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('content').innerHTML = xhr.responseText;
            if (page === '页面/设置.html') {
                loadSettings();
            }
        } else if (xhr.readyState === 4) {
            alert('页面加载失败，请重试。');
        }
    };
    xhr.send();
}

// 加载默认页面
function loadDefaultPage() {
    var defaultPage = localStorage.getItem('defaultPage') || '主页.html';
    loadPage('页面/' + defaultPage);
}

// 加载设置
function loadSettings() {
    document.getElementById('defaultPage').value = localStorage.getItem('defaultPage') || '主页.html';
    document.getElementById('themeToggle').checked = localStorage.getItem('theme') === 'dark';
    document.getElementById('themeToggle').addEventListener('change', toggleTheme);
    updateThemeLabel();

    document.getElementById('notifications').checked = localStorage.getItem('notifications') === 'true';
    document.getElementById('backgroundColor').value = localStorage.getItem('backgroundColor') || '#ffffff';
    document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';

    var theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#333333';
    } else {
        document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';
    }
}

// 保存默认页面
function saveDefaultPage() {
    var defaultPage = document.getElementById('defaultPage').value;
    localStorage.setItem('defaultPage', defaultPage);
    alert('默认页面已保存！');
}

// 保存通知设置
function saveNotifications() {
    var notificationsEnabled = document.getElementById('notifications').checked;
    localStorage.setItem('notifications', notificationsEnabled);
    alert('通知设置已保存！');
    if (notificationsEnabled) {
        enableNotifications();
    } else {
        disableNotifications();
    }
}

// 启用通知
function enableNotifications() {
    if (Notification.permission === 'granted') {
        new Notification('通知已启用！');
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('通知已启用！');
            }
        });
    }
}

// 禁用通知
function disableNotifications() {
    alert('通知已禁用！');
}

// 保存背景颜色
function saveBackgroundColor() {
    var backgroundColor = document.getElementById('backgroundColor').value;
    localStorage.setItem('backgroundColor', backgroundColor);
    alert('背景颜色已保存！');
    document.body.style.backgroundColor = backgroundColor;
}

// 切换主题
function toggleTheme() {
    var theme = document.getElementById('themeToggle').checked ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme();
    updateThemeLabel();

    if (theme === 'dark') {
        document.body.style.backgroundColor = '#333333';
    } else {
        document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';
    }
}

// 应用主题
function applyTheme() {
    var theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

// 更新主题标签
function updateThemeLabel() {
    var theme = localStorage.getItem('theme') || 'light';
    var themeLabel = document.getElementById('themeLabel');
    themeLabel.textContent = theme === 'dark' ? '当前主题：深色模式' : '当前主题：浅色模式';
}

// 更新版本号
function updateVersionNumber() {
    const storedVersion = localStorage.getItem('version');
    if (storedVersion) {
        document.getElementById('versionNumber').textContent = storedVersion;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    fetch('/StreePortal/version.txt')
    .then(response => response.text())
    .then(version => {
        localStorage.setItem('version', version.trim());
        updateVersionNumber();
    })
    .catch(error => console.error('Error fetching version:', error));
});
