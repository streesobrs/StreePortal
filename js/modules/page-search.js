// 页面搜索管理模块
const PageSearch = (() => {
    // DOM 元素
    let searchContainer = null;
    let searchInput = null;
    let searchButton = null;
    let clearButton = null;
    let searchResultsCount = null;
    
    // 初始化
    function init() {
        createSearchUI();
        setupEventListeners();
    }
    
    // 创建搜索UI
    function createSearchUI() {
        // 创建搜索容器
        searchContainer = document.createElement('div');
        searchContainer.id = 'page-search-container';
        searchContainer.className = 'relative mb-6 max-w-2xl mx-auto';
        
        // 创建搜索输入框
        searchInput = document.createElement('input');
        searchInput.id = 'page-search-input';
        searchInput.type = 'text';
        searchInput.placeholder = '搜索页面...';
        searchInput.className = 'w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all';
        
        // 创建搜索图标
        const searchIcon = document.createElement('div');
        searchIcon.className = 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400';
        searchIcon.innerHTML = '\u003ci class="fas fa-search">\u003c/i>';
        
        // 创建搜索按钮
        searchButton = document.createElement('button');
        searchButton.id = 'page-search-button';
        searchButton.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all';
        searchButton.textContent = '搜索';
        
        // 创建清除按钮
        clearButton = document.createElement('button');
        clearButton.id = 'page-search-clear';
        clearButton.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden';
        clearButton.innerHTML = '\u003ci class="fas fa-times-circle">\u003c/i>';
        clearButton.title = '清除搜索';
        
        // 创建搜索结果数量统计
        searchResultsCount = document.createElement('div');
        searchResultsCount.id = 'search-results-count';
        searchResultsCount.className = 'mt-2 text-sm text-gray-500 dark:text-gray-400 text-center';
        searchResultsCount.textContent = '显示所有页面';
        
        // 组装搜索容器
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(clearButton);
        searchContainer.appendChild(searchButton);
        
        // 查找合适的位置插入搜索框
        // 尝试找到页面容器的父元素或主要内容区域
        let insertionPoint = document.getElementById('pages-container');
        if (insertionPoint && insertionPoint.parentNode) {
            // 在页面容器前插入
            insertionPoint.parentNode.insertBefore(searchContainer, insertionPoint);
            // 在搜索容器后插入结果统计
            insertionPoint.parentNode.insertBefore(searchResultsCount, insertionPoint);
        } else {
            // 如果找不到合适的位置，添加到body中
            document.body.appendChild(searchContainer);
            document.body.appendChild(searchResultsCount);
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 搜索输入事件
        searchInput.addEventListener('input', handleSearchInput);
        
        // 搜索按钮点击事件
        searchButton.addEventListener('click', performSearch);
        
        // 清除按钮点击事件
        clearButton.addEventListener('click', clearSearch);
        
        // 回车键搜索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 处理搜索输入
    function handleSearchInput() {
        // 显示/隐藏清除按钮
        if (searchInput.value.trim()) {
            clearButton.classList.remove('hidden');
            searchButton.classList.add('hidden');
        } else {
            clearButton.classList.add('hidden');
            searchButton.classList.remove('hidden');
        }
        
        // 实时搜索
        performSearch();
    }
    
    // 执行搜索
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.card-hover');
        let visibleCount = 0;
        
        // 遍历所有页面卡片
        cards.forEach(card => {
            // 获取卡片文本内容进行搜索
            const title = card.querySelector('.text-lg')?.textContent || '';
            const description = card.querySelector('.text-sm')?.textContent || '';
            const pagePath = card.getAttribute('data-path') || '';
            
            // 搜索标题、描述和路径
            const titleMatch = title.toLowerCase().includes(searchTerm);
            const descriptionMatch = description.toLowerCase().includes(searchTerm);
            const pathMatch = pagePath.toLowerCase().includes(searchTerm);
            
            // 判断是否匹配
            const isMatch = searchTerm === '' || titleMatch || descriptionMatch || pathMatch;
            
            // 显示或隐藏卡片
            if (isMatch) {
                card.style.display = '';
                visibleCount++;
                
                // 高亮搜索文本
                highlightSearchText(card, searchTerm);
            } else {
                card.style.display = 'none';
            }
        });
        
        // 更新搜索结果统计
        updateResultsCount(visibleCount, cards.length);
        
        // 如果搜索有结果，滚动到第一个可见的卡片
        if (searchTerm && visibleCount > 0) {
            const firstVisibleCard = document.querySelector('.card-hover:not([style*="display: none"])');
            if (firstVisibleCard) {
                firstVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // 高亮搜索文本
    function highlightSearchText(element, searchTerm) {
        if (!searchTerm) {
            // 清除所有高亮
            const highlightedElements = element.querySelectorAll('.search-highlight');
            highlightedElements.forEach(highlighted => {
                const parent = highlighted.parentNode;
                parent.replaceChild(document.createTextNode(highlighted.textContent), highlighted);
            });
            return;
        }
        
        // 需要搜索的元素
        const elementsToSearch = [element.querySelector('.text-lg'), element.querySelector('.text-sm')];
        
        elementsToSearch.forEach(el => {
            if (el) {
                // 保存原始文本
                const originalText = el.textContent;
                
                // 清除现有的高亮
                el.innerHTML = originalText;
                
                // 创建正则表达式进行大小写不敏感的搜索
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                
                // 替换匹配的文本为高亮版本
                const highlightedHTML = originalText.replace(regex, '<span class="search-highlight bg-yellow-200 dark:bg-yellow-900/30 px-0.5 rounded">$1</span>');
                
                // 应用高亮
                el.innerHTML = highlightedHTML;
            }
        });
    }
    
    // 更新搜索结果统计
    function updateResultsCount(visibleCount, totalCount) {
        if (!searchResultsCount) return;
        
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            searchResultsCount.textContent = `显示所有 ${totalCount} 个页面`;
        } else if (visibleCount === 0) {
            searchResultsCount.textContent = `未找到匹配的页面"${searchTerm}"`;
            searchResultsCount.className = 'mt-2 text-sm text-red-500 dark:text-red-400 text-center';
        } else {
            searchResultsCount.textContent = `找到 ${visibleCount} 个匹配的页面 (共 ${totalCount} 个)`;
            searchResultsCount.className = 'mt-2 text-sm text-gray-500 dark:text-gray-400 text-center';
        }
    }
    
    // 清除搜索
    function clearSearch() {
        searchInput.value = '';
        clearButton.classList.add('hidden');
        searchButton.classList.remove('hidden');
        performSearch();
        searchInput.focus();
    }
    
    // 获取当前搜索词
    function getCurrentSearchTerm() {
        return searchInput.value.trim();
    }
    
    // 聚焦搜索框
    function focusSearch() {
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // 添加全局快捷键支持（Ctrl/Cmd + K）
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 检查是否按下了Ctrl+K或Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                focusSearch();
            }
        });
    }
    
    // 导出方法
    return {
        init,
        performSearch,
        clearSearch,
        getCurrentSearchTerm,
        focusSearch,
        setupKeyboardShortcuts
    };
})();