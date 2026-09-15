// ====== 同步管理模块（完整实现） ======
const SyncManager = (() => {
    // ===== 常量 =====
    const GIST_FILENAME = 'streeportal-sync.json';
    const GIST_STORAGE_KEY = 'streeportal_gist_creds';  // 存 gist id
    const TOKEN_STORAGE_KEY = 'streeportal_github_token';
    const SETTINGS_KEY = 'streeportal_sync_settings';

    // ===== DOM =====
    const $ = (id) => document.getElementById(id);
    const syncBtn = $('sync-btn');
    const lastSyncTimeEl = $('last-sync-time');
    const gistTokenEl = $('gist-token');
    const gistIdEl = $('gist-id');
    const gistConnectBtn = $('gist-connect-btn');
    const gistPushBtn = $('gist-push-btn');
    const gistPullBtn = $('gist-pull-btn');
    const gistDisconnectBtn = $('gist-disconnect-btn');
    const gistStatusText = $('gist-status-text');
    const gistConnectedBadge = $('gist-connected-badge');
    const autoSyncToggle = $('auto-sync');
    const syncIntervalSel = $('sync-interval');
    const syncNotifications = $('sync-notifications');
    const exportBtn = $('export-in-settings-btn');
    const importBtn = $('import-in-settings-btn');
    const importFileInput = document.getElementById('import-in-settings-btn');
    const clearDataBtn = $('clear-data-btn');

    // 定时器 id
    let autoSyncTimer = null;

    // ===== 初始化 =====
    function init() {
        loadSettings();
        restoreGistState();
        bindEvents();
        updateConnectedUI();
        startAutoSyncIfNeeded();
        refreshLastSyncTime();
    }

    // ===== 设置持久化 =====
    function loadSettings() {
        try {
            const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
            if (typeof s.autoSync === 'boolean') autoSyncToggle.checked = s.autoSync;
            if (s.interval) syncIntervalSel.value = s.interval;
            if (typeof s.notifications === 'boolean') syncNotifications.checked = s.notifications;
        } catch (e) { }
    }

    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
            autoSync: autoSyncToggle.checked,
            interval: syncIntervalSel.value,
            notifications: syncNotifications.checked
        }));
    }

    // ===== Gist 凭据管理 =====
    function getToken() {
        return localStorage.getItem(TOKEN_STORAGE_KEY) || gistTokenEl.value.trim();
    }
    function setToken(t) {
        if (t) localStorage.setItem(TOKEN_STORAGE_KEY, t);
    }
    function getGistId() {
        const creds = JSON.parse(localStorage.getItem(GIST_STORAGE_KEY) || '{}');
        return creds.id || gistIdEl.value.trim();
    }
    function setGistId(id) {
        const creds = JSON.parse(localStorage.getItem(GIST_STORAGE_KEY) || '{}');
        creds.id = id;
        localStorage.setItem(GIST_STORAGE_KEY, JSON.stringify(creds));
    }
    function clearGistCreds() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(GIST_STORAGE_KEY);
    }

    function restoreGistState() {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const creds = JSON.parse(localStorage.getItem(GIST_STORAGE_KEY) || '{}');
        if (token) gistTokenEl.value = token;
        if (creds.id) gistIdEl.value = creds.id;
    }

    function isConnected() {
        return !!(getToken() && getGistId());
    }

    function updateConnectedUI() {
        if (isConnected()) {
            gistConnectedBadge.classList.remove('hidden');
            gistPushBtn.disabled = false;
            gistPullBtn.disabled = false;
            gistDisconnectBtn.disabled = false;
            gistConnectBtn.textContent = '重新测试';
            gistStatusText.textContent = `已连接 · Gist: ${getGistId().slice(0, 8)}…`;
            gistStatusText.className = 'text-xs text-green-600';
        } else {
            gistConnectedBadge.classList.add('hidden');
            gistPushBtn.disabled = true;
            gistPullBtn.disabled = true;
            gistDisconnectBtn.disabled = true;
            gistConnectBtn.textContent = '连接 / 创建';
            gistStatusText.textContent = '未连接 —— 输入 Token 后点击"连接 / 创建"';
            gistStatusText.className = 'text-xs text-gray-400';
        }
    }

    // ===== GitHub Gist API =====
    const GIST_API = 'https://api.github.com';

    async function githubRequest(method, path, body) {
        const token = getToken();
        if (!token) throw new Error('缺少 GitHub Token');
        const res = await fetch(GIST_API + path, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            let details = '';
            try {
                const json = await res.json();
                details = json.message || res.statusText;
                if (json.documentation_url) details += ` (${json.documentation_url})`;
            } catch {
                details = await res.text().catch(() => res.statusText);
            }
            // 对 401 给出友好提示
            if (res.status === 401) {
                throw new Error('Token 无效或已过期。请确认 Token 未被删除，且包含 gist 权限。');
            }
            if (res.status === 403) {
                throw new Error('权限不足。Token 可能没有 gist 范围，或触发了 GitHub 速率限制。');
            }
            throw new Error(`${res.status}: ${details}`);
        }
        return res.json();
    }

    // 先验证 Token 是否有效（GET /user）
    async function verifyToken() {
        try {
            const user = await githubRequest('GET', '/user');
            return { ok: true, user: user.login };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    // 连接：如果有 gistId 就测试是否可访问；否则创建新的 secret gist
    async function connectOrCreate() {
        const token = gistTokenEl.value.trim();
        if (!token) {
            UIHelpers.showToast('请先输入 GitHub Token', 'error');
            return;
        }
        setToken(token);

        // 第一步：先验证 Token 本身是否有效
        const verify = await verifyToken();
        if (!verify.ok) {
            UIHelpers.showToast(`Token 验证失败: ${verify.error}`, 'error');
            return;
        }
        gistStatusText.textContent = `Token 有效 (${verify.user})`;
        gistStatusText.className = 'text-xs text-blue-600';

        const gistId = gistIdEl.value.trim();
        if (gistId) {
            // 测试现有 gist 是否可访问 + 是否属于当前用户
            try {
                const gist = await githubRequest('GET', `/gists/${gistId}`);
                if (gist.owner && gist.owner.login !== verify.user) {
                    UIHelpers.showToast(
                        `警告: 这个 Gist 属于 ${gist.owner.login}，不是你的(${verify.user})。` +
                        `上传会失败。建议清空 Gist ID 重新创建属于你自己的。`,
                        'error'
                    );
                } else {
                    setGistId(gistId);
                    UIHelpers.showToast('连接成功', 'success');
                }
            } catch (e) {
                UIHelpers.showToast(`连接失败: ${e.message}`, 'error');
            }
        } else {
            // 创建新的 gist
            try {
                const payload = {
                    description: 'StreePortal sync data - auto generated',
                    public: false,
                    files: {}
                };
                payload.files[GIST_FILENAME] = {
                    content: JSON.stringify({
                        updatedAt: new Date().toISOString(),
                        note: 'StreePortal sync storage'
                    }, null, 2)
                };
                const result = await githubRequest('POST', '/gists', payload);
                setGistId(result.id);
                gistIdEl.value = result.id;
                UIHelpers.showToast(`Gist 创建成功 (${result.id.slice(0, 8)}…`, 'success');
            } catch (e) {
                UIHelpers.showToast(`创建失败: ${e.message}`, 'error');
            }
        }
        updateConnectedUI();
    }

    // 打包所有 localStorage 数据
    function collectAllData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        return data;
    }

    // 推送数据到 Gist
    async function pushToGist(silent) {
        if (!isConnected()) return;
        gistPushBtn.disabled = true;
        const originalText = gistPushBtn.innerHTML;
        gistPushBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i>上传中...';

        try {
            const payload = {
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify({
                            updatedAt: new Date().toISOString(),
                            data: collectAllData()
                        }, null, 2)
                    }
                }
            };
            await githubRequest('PATCH', `/gists/${getGistId()}`, payload);
            markSynced();
            if (!silent || syncNotifications.checked) {
                UIHelpers.showToast('已上传到云端', 'success');
            }
        } catch (e) {
            UIHelpers.showToast(`上传失败: ${e.message}`, 'error');
        } finally {
            gistPushBtn.disabled = false;
            gistPushBtn.innerHTML = originalText;
        }
    }

    // 从 Gist 拉取数据
    async function pullFromGist() {
        if (!isConnected()) return;
        gistPullBtn.disabled = true;
        const originalText = gistPullBtn.innerHTML;
        gistPullBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i>拉取中...';

        try {
            const gist = await githubRequest('GET', `/gists/${getGistId()}`);
            const file = gist.files[GIST_FILENAME];
            if (!file) throw new Error('Gist 中未找到同步文件，请先上传');

            const remote = JSON.parse(file.content);
            if (!remote.data || typeof remote.data !== 'object') {
                throw new Error('云端数据格式异常');
            }

            // 写入 localStorage（先清空再批量写入，避免旧 key 残留）
            const toRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k.startsWith('streeportal_')) continue;  // 保留配置项
                if (!(k in remote.data)) toRemove.push(k);
            }
            toRemove.forEach(k => localStorage.removeItem(k));

            Object.entries(remote.data).forEach(([k, v]) => {
                localStorage.setItem(k, v);
            });

            markSynced();
            UIHelpers.showToast(`已从云端恢复（${Object.keys(remote.data).length} 项）`, 'success');
        } catch (e) {
            UIHelpers.showToast(`拉取失败: ${e.message}`, 'error');
        } finally {
            gistPullBtn.disabled = false;
            gistPullBtn.innerHTML = originalText;
        }
    }

    function disconnectGist() {
        clearGistCreds();
        gistTokenEl.value = '';
        gistIdEl.value = '';
        updateConnectedUI();
        stopAutoSync();
        UIHelpers.showToast('已断开云端同步', 'info');
    }

    // ===== 定时自动同步 =====
    function startAutoSyncIfNeeded() {
        if (!autoSyncToggle.checked) return;
        if (!isConnected()) return;
        const minutes = parseInt(syncIntervalSel.value, 10) || 30;
        stopAutoSync();
        autoSyncTimer = setInterval(() => {
            pushToGist(true);
        }, minutes * 60 * 1000);
        console.log(`[SyncManager] 自动同步已启动，每 ${minutes} 分钟`);
    }

    function stopAutoSync() {
        if (autoSyncTimer) {
            clearInterval(autoSyncTimer);
            autoSyncTimer = null;
        }
    }

    // ===== 导出 / 导入 / 清除（备份方案 A）=====
    function exportData() {
        const all = collectAllData();
        const blob = new Blob([JSON.stringify({
            version: 1,
            exportedAt: new Date().toISOString(),
            data: all
        }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.download = `streeportal-backup-${ts}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UIHelpers.showToast('数据已导出', 'success');
    }

    function importData(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result);
                if (!json.data || typeof json.data !== 'object') {
                    throw new Error('无效的备份文件');
                }
                Object.entries(json.data).forEach(([k, v]) => {
                    localStorage.setItem(k, v);
                });
                UIHelpers.showToast(`已导入 ${Object.keys(json.data).length} 项数据，页面刷新后生效`, 'success');
                if (confirm('数据导入成功，是否现在刷新页面？')) {
                    window.location.reload();
                }
            } catch (e) {
                UIHelpers.showToast(`导入失败: ${e.message}`, 'error');
            }
        };
        reader.onerror = () => UIHelpers.showToast('读取文件失败', 'error');
        reader.readAsText(file);
    }

    function clearAllData() {
        if (!confirm('确认删除所有本地数据？此操作不可恢复！')) return;
        // 保留同步配置（token/settings）
        const keep = {};
        const keepKeys = [TOKEN_STORAGE_KEY, GIST_STORAGE_KEY, SETTINGS_KEY];
        keepKeys.forEach(k => { keep[k] = localStorage.getItem(k); });

        localStorage.clear();

        // 恢复保留项
        Object.entries(keep).forEach(([k, v]) => {
            if (v !== null) localStorage.setItem(k, v);
        });

        markSynced('从未同步');
        UIHelpers.showToast('所有数据已清除', 'success');
    }

    // ===== 同步时间显示 =====
    function markSynced(customText) {
        localStorage.setItem('streeportal_last_sync', new Date().toISOString());
        refreshLastSyncTime(customText);
    }

    function refreshLastSyncTime(customText) {
        if (customText) {
            lastSyncTimeEl.textContent = customText;
            return;
        }
        const last = localStorage.getItem('streeportal_last_sync');
        if (!last) {
            lastSyncTimeEl.textContent = '从未同步';
            return;
        }
        try {
            const d = new Date(last);
            const now = new Date();
            const diff = (now - d) / 1000;
            let text;
            if (diff < 60) text = '刚刚';
            else if (diff < 3600) text = `${Math.floor(diff / 60)} 分钟前`;
            else if (diff < 86400) text = `${Math.floor(diff / 3600)} 小时前`;
            else text = `${Math.floor(diff / 86400)} 天前`;
            lastSyncTimeEl.textContent = `${text} (${d.toLocaleString()})`;
        } catch {
            lastSyncTimeEl.textContent = '从未同步';
        }
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 导航栏的云朵图标按钮 → 触发上传
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                if (isConnected()) pushToGist();
                else {
                    UIHelpers.showToast('请先在 设置 → 同步设置 中连接 GitHub Gist', 'info');
                }
            });
        }

        gistConnectBtn?.addEventListener('click', connectOrCreate);
        gistPushBtn?.addEventListener('click', () => pushToGist());
        gistPullBtn?.addEventListener('click', pullFromGist);
        gistDisconnectBtn?.addEventListener('click', disconnectGist);

        autoSyncToggle?.addEventListener('change', () => {
            saveSettings();
            startAutoSyncIfNeeded();
        });
        syncIntervalSel?.addEventListener('change', () => {
            saveSettings();
            startAutoSyncIfNeeded();
        });
        syncNotifications?.addEventListener('change', saveSettings);

        exportBtn?.addEventListener('click', exportData);
        importFileInput?.addEventListener('change', (e) => {
            importData(e.target.files?.[0]);
            e.target.value = '';  // 允许再次选同一个文件
        });
        clearDataBtn?.addEventListener('click', clearAllData);

        // 使用教程折叠/展开
        const tutorialToggle = $('gist-tutorial-toggle');
        const tutorialContent = $('gist-tutorial-content');
        const tutorialChevron = $('gist-tutorial-chevron');
        if (tutorialToggle && tutorialContent) {
            tutorialToggle.addEventListener('click', () => {
                const hidden = tutorialContent.classList.toggle('hidden');
                if (tutorialChevron) {
                    tutorialChevron.style.transform = hidden ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }
    }

    // ===== 公开 =====
    return {
        init,
        exportData,
        importData,
        pushToGist,
        pullFromGist,
        disconnectGist,
        isConnected
    };
})();

document.addEventListener('DOMContentLoaded', () => SyncManager.init());
