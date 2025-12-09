// 页面收藏管理模块
const FavoritesManager = (() => {
    // 存储收藏的页面
    let favorites = [];
    const STORAGE_KEY = 'pageFavorites';

    // 初始化
    function init() {
        loadFromStorage();
        setupFavoriteButtons();
        highlightFavorites();
    }

    // 从本地存储加载收藏列表
    function loadFromStorage() {
        const savedFavorites = localStorage.getItem(STORAGE_KEY);
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
        }
    }

    // 保存收藏列表到本地存储
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }

    // 设置收藏按钮
    function setupFavoriteButtons() {
        const cards = document.querySelectorAll('.card-hover');

        cards.forEach(card => {
            // 获取页面信息
            const pagePath = card.getAttribute('data-path') || '';
            const pageTitle = card.querySelector('.text-lg')?.textContent || '未命名页面';

            // 创建收藏按钮
            const favoriteButton = document.createElement('button');
            favoriteButton.className = 'absolute top-3 right-3 text-gray-400 hover:text-yellow-400 transition-colors';
            favoriteButton.innerHTML = favorites.some(fav => fav.path === pagePath)
                ? '<i class="fas fa-star text-yellow-400"></i>'
                : '<i class="far fa-star"></i>';
            favoriteButton.title = favorites.some(fav => fav.path === pagePath) ? '取消收藏' : '添加收藏';
            favoriteButton.ariaLabel = favorites.some(fav => fav.path === pagePath) ? '取消收藏' : '添加收藏';

            // 添加点击事件
            favoriteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
                toggleFavorite(pagePath, pageTitle);
            });

            // 将按钮添加到卡片中
            card.style.position = 'relative';
            card.appendChild(favoriteButton);
        });
    }

    // 高亮收藏的页面
    function highlightFavorites() {
        const cards = document.querySelectorAll('.card-hover');

        cards.forEach(card => {
            const pagePath = card.getAttribute('data-path') || '';
            const isFavorite = favorites.some(fav => fav.path === pagePath);

            if (isFavorite) {
                card.classList.add('border-yellow-300', 'ring-1', 'ring-yellow-300');
            }
        });
    }

    // 切换收藏状态
    function toggleFavorite(pagePath, pageTitle) {
        const index = favorites.findIndex(fav => fav.path === pagePath);

        if (index > -1) {
            // 取消收藏
            favorites.splice(index, 1);
            UIHelpers.showToast('已取消收藏：' + pageTitle, 'info');
        } else {
            // 添加收藏
            favorites.push({ path: pagePath, title: pageTitle, timestamp: Date.now() });
            UIHelpers.showToast('已添加到收藏：' + pageTitle, 'success');
        }

        // 保存到存储
        saveToStorage();

        // 更新UI
        updateFavoriteButtons();
        highlightFavorites();

        // 更新收藏列表
        updateFavoritesList();
    }

    // 更新收藏按钮状态
    function updateFavoriteButtons() {
        // 移除错误的closest()调用
        document.querySelectorAll('.card-hover button .fa-star').forEach(icon => {
            const button = icon.closest('button');
            const card = button.closest('.card-hover');
            const pagePath = card.getAttribute('data-path') || '';
            const isFavorite = favorites.some(fav => fav.path === pagePath);

            if (isFavorite) {
                // 确保使用五角星图标（star）
                icon.className = 'fas fa-star text-yellow-400';
                button.title = '取消收藏';
                button.ariaLabel = '取消收藏';
            } else {
                // 确保使用空心五角星图标（star）
                icon.className = 'far fa-star';
                button.title = '添加收藏';
                button.ariaLabel = '添加收藏';
            }
        });
    }

    // 获取收藏列表
    function getFavorites() {
        return [...favorites];
    }

    // 更新收藏列表UI
    function updateFavoritesList() {
        // 检查是否存在收藏列表容器
        let favoritesContainer = document.getElementById('favorites-container');

        if (!favoritesContainer) {
            // 创建收藏列表容器
            favoritesContainer = document.createElement('div');
            favoritesContainer.id = 'favorites-container';
            favoritesContainer.className = 'mt-8';

            // 创建标题
            const title = document.createElement('h2');
            title.className = 'text-xl font-bold mb-4';
            title.innerHTML = '<i class="fas fa-star text-yellow-400 mr-2"></i>我的收藏';
            favoritesContainer.appendChild(title);

            // 创建收藏列表
            const favoritesList = document.createElement('div');
            favoritesList.id = 'favorites-list';
            favoritesList.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
            favoritesContainer.appendChild(favoritesList);

            // 插入到页面中
            const pagesContainer = document.getElementById('pages-container');
            if (pagesContainer && pagesContainer.parentNode) {
                pagesContainer.parentNode.insertBefore(favoritesContainer, pagesContainer.nextSibling);
            }
        }

        // 更新收藏列表内容
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';

        if (favorites.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'col-span-full text-center p-8 text-gray-500';
            emptyMessage.textContent = '暂无收藏页面，点击页面卡片上的星星图标添加收藏';
            favoritesList.appendChild(emptyMessage);
        } else {
            // 按时间戳排序，最新收藏的排在前面
            const sortedFavorites = [...favorites].sort((a, b) => b.timestamp - a.timestamp);

            sortedFavorites.forEach(favorite => {
                // 创建收藏卡片
                const card = document.createElement('div');
                card.className = 'card-hover rounded-xl bg-white dark:bg-gray-800 shadow-md transition-all border-yellow-300 ring-1 ring-yellow-300 cursor-pointer';
                card.setAttribute('data-path', favorite.path);

                // 卡片内容
                card.innerHTML = `
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${favorite.title}</h3>
                            <span class="inline-flex items-center justify-center p-1.5 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <i class="fas fa-star text-xs text-yellow-400"></i>
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${favorite.path}</p>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-xs text-gray-400">收藏于 ${formatDate(favorite.timestamp)}</span>
                            <button class="text-xs text-gray-400 hover:text-red-500 unpin-favorite" data-path="${favorite.path}">
                                <i class="fas fa-times"></i> 取消收藏
                            </button>
                        </div>
                    </div>
                `;

                // 添加点击事件
                card.addEventListener('click', (e) => {
                    // 如果点击的是取消收藏按钮，不触发页面加载
                    if (e.target.closest('.unpin-favorite')) {
                        return;
                    }
                    // 加载对应的页面
                    PageNavigation.loadPage(favorite.path);
                });

                // 添加取消收藏按钮事件
                const unpinButton = card.querySelector('.unpin-favorite');
                unpinButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(favorite.path, favorite.title);
                });

                favoritesList.appendChild(card);
            });
        }
    }

    // 格式化日期
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 导出方法
    return {
        init,
        getFavorites,
        updateFavoritesList
    };
})();