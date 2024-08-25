function loadSettings() {
    document.getElementById('defaultPage').value = localStorage.getItem('defaultPage') || '主页.html';
    document.getElementById('themeToggle').checked = localStorage.getItem('theme') === 'dark';
    document.getElementById('themeToggle').addEventListener('change', toggleTheme);
    updateThemeLabel();

    document.getElementById('notifications').checked = localStorage.getItem('notifications') === 'true';
    document.getElementById('backgroundColor').value = localStorage.getItem('backgroundColor') || '#ffffff';
    document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';

    // 检查当前主题并设置背景颜色
    var theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#333333'; // 深色模式背景颜色
    } else {
        document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff'; // 浅色模式背景颜色
    }
}

function saveDefaultPage() {
    var defaultPage = document.getElementById('defaultPage').value;
    localStorage.setItem('defaultPage', defaultPage);
    alert('默认页面已保存！');
}

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

function disableNotifications() {
    alert('通知已禁用！');
}

function saveBackgroundColor() {
    var backgroundColor = document.getElementById('backgroundColor').value;
    localStorage.setItem('backgroundColor', backgroundColor);
    alert('背景颜色已保存！');
    document.body.style.backgroundColor = backgroundColor;
}

function toggleTheme() {
    var theme = document.getElementById('themeToggle').checked ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme();
    updateThemeLabel();

    // 设置背景颜色
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#333333'; // 深色模式背景颜色
    } else {
        document.body.style.backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff'; // 浅色模式背景颜色
    }
}

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

function updateThemeLabel() {
    var theme = localStorage.getItem('theme') || 'light';
    var themeLabel = document.getElementById('themeLabel');
    themeLabel.textContent = theme === 'dark' ? '当前主题：深色模式' : '当前主题：浅色模式';
}

function loadPage(page) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', page, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('content').innerHTML = xhr.responseText;
            if (page === '页面/设置.html') {
                loadSettings();
            }
        }
    };
    xhr.send();
}

function loadDefaultPage() {
    var defaultPage = localStorage.getItem('defaultPage') || '主页.html';
    loadPage('页面/' + defaultPage);
}
