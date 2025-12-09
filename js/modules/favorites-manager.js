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
        updateFavoritesList(); // 添加这行，确保页面加载时显示收藏列表
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
            // 生成唯一ID，确保每个卡片都有唯一标识
            const uniqueId = pagePath + '_' + Math.random().toString(36).substr(2, 9);
            card.setAttribute('data-unique-id', uniqueId);

            // 优先使用按钮的data-title属性，其次使用卡片中的text-lg元素，最后使用默认值
            const loadButton = card.querySelector('.load-page-btn');
            const pageTitle = loadButton?.getAttribute('data-title') ||
                card.querySelector('.text-lg')?.textContent ||
                '未命名页面';

            // 创建收藏按钮
            const favoriteButton = document.createElement('button');
            favoriteButton.className = 'favorite-button absolute top-3 right-3 text-gray-400 hover:text-yellow-400 transition-colors';
            favoriteButton.setAttribute('data-path', pagePath);
            favoriteButton.setAttribute('data-unique-id', uniqueId);

            // 查找是否已收藏
            const isFavorite = favorites.some(fav => {
                // 优先使用uniqueId匹配，如果没有则使用path
                return fav.uniqueId === uniqueId || (fav.path === pagePath && !fav.uniqueId);
            });

            favoriteButton.innerHTML = isFavorite
                ? '<span class="inline-flex items-center justify-center p-1.5 bg-yellow-100 dark:bg-yellow-900 rounded-full"><i class="fa fa-star text-xs text-yellow-400"></i></span>'
                : '<span class="inline-flex items-center justify-center p-1.5 rounded-full"><i class="fa fa-star-o text-xs"></i></span>';
            favoriteButton.title = isFavorite ? '取消收藏：' + pageTitle : '添加收藏：' + pageTitle;
            favoriteButton.ariaLabel = isFavorite ? '取消收藏：' + pageTitle : '添加收藏：' + pageTitle;

            // 添加点击事件
            favoriteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
                toggleFavorite(pagePath, pageTitle, uniqueId);
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
            const uniqueId = card.getAttribute('data-unique-id') || '';

            // 优先使用uniqueId检查收藏状态，其次使用path
            const isFavorite = favorites.some(fav => {
                return fav.uniqueId === uniqueId || (fav.path === pagePath && !fav.uniqueId);
            });

            if (isFavorite) {
                card.classList.add('border-yellow-300', 'ring-1', 'ring-yellow-300');
            } else {
                // 移除高亮，如果之前添加过
                card.classList.remove('border-yellow-300', 'ring-1', 'ring-yellow-300');
            }
        });
    }

    // 切换收藏状态
    function toggleFavorite(pagePath, pageTitle, uniqueId) {
        // 确保标题获取逻辑与setupFavoriteButtons一致
        const cards = document.querySelectorAll('.card-hover');
        let finalTitle = pageTitle; // 使用传入的标题作为默认值

        // 查找对应的卡片，获取更准确的标题
        for (const card of cards) {
            if (card.getAttribute('data-unique-id') === uniqueId || card.getAttribute('data-path') === pagePath) {
                const loadButton = card.querySelector('.load-page-btn');
                const foundTitle = loadButton?.getAttribute('data-title') ||
                    card.querySelector('.text-lg')?.textContent ||
                    '未命名页面';
                if (foundTitle !== '未命名页面') {
                    finalTitle = foundTitle;
                }
                break;
            }
        }

        // 优先使用uniqueId查找，其次使用path
        const index = favorites.findIndex(fav => fav.uniqueId === uniqueId || (fav.path === pagePath && !fav.uniqueId));

        if (index > -1) {
            // 取消收藏
            favorites.splice(index, 1);
            UIHelpers.showToast('已取消收藏：' + finalTitle, 'info');
        } else {
            // 添加收藏，包含uniqueId
            favorites.push({ path: pagePath, title: finalTitle, timestamp: Date.now(), uniqueId: uniqueId });
            UIHelpers.showToast('已添加到收藏：' + finalTitle, 'success');
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
        // 获取所有收藏按钮并更新其状态
        document.querySelectorAll('.favorite-button').forEach(button => {
            const pagePath = button.getAttribute('data-path') || '';
            const uniqueId = button.getAttribute('data-unique-id') || '';

            // 优先使用uniqueId检查收藏状态，其次使用path
            const isFavorite = favorites.some(fav => {
                return fav.uniqueId === uniqueId || (fav.path === pagePath && !fav.uniqueId);
            });

            // 获取对应的卡片
            const card = button.closest('.card-hover');

            // 确保标题获取逻辑一致
            const loadButton = card?.querySelector('.load-page-btn');
            const pageTitle = loadButton?.getAttribute('data-title') ||
                card?.querySelector('.text-lg')?.textContent ||
                '未命名页面';

            // 替换整个按钮内容，使用与setupFavoriteButtons一致的span包装图标结构
            if (isFavorite) {
                button.innerHTML = '<span class="inline-flex items-center justify-center p-1.5 bg-yellow-100 dark:bg-yellow-900 rounded-full"><i class="fa fa-star text-xs text-yellow-400"></i></span>';
                button.title = '取消收藏：' + pageTitle;
                button.ariaLabel = '取消收藏：' + pageTitle;
            } else {
                button.innerHTML = '<span class="inline-flex items-center justify-center p-1.5 rounded-full"><i class="fa fa-star-o text-xs"></i></span>';
                button.title = '添加收藏：' + pageTitle;
                button.ariaLabel = '添加收藏：' + pageTitle;
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
            title.innerHTML = '<i class="fa fa-star text-yellow-400 mr-2"></i>我的收藏';
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
                                <i class="fa fa-star text-xs text-yellow-400"></i>
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${favorite.path}</p>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-xs text-gray-400">收藏于 ${formatDate(favorite.timestamp)}</span>
                            <button class="text-xs text-gray-400 hover:text-red-500 unpin-favorite" data-path="${favorite.path}">
                                <i class="fa fa-times"></i> 取消收藏
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
                    // 传递favorite对象中的uniqueId（如果有）
                    toggleFavorite(favorite.path, favorite.title, favorite.uniqueId);
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