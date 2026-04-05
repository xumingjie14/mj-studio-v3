// MJ工作室 · 新闻监控集成 (基于situation-monitor项目)

class NewsMonitor {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 10 * 60 * 1000; // 10分钟缓存
        this.newsLimit = 20; // 每类新闻显示数量
        
        // 新闻分类配置 (中文)
        this.categories = [
            { id: 'finance', name: '财经', keywords: ['财经', '股市', '经济', '银行', '美联储', '财政部'] },
            { id: 'politics', name: '政治', keywords: ['政治', '政府', '选举', '国会', '外交'] },
            { id: 'tech', name: '科技', keywords: ['科技', '人工智能', '软件', '初创', '硅谷'] },
            { id: 'markets', name: '市场', keywords: ['市场', '交易', '投资', '证券', '期货'] },
            { id: 'crypto', name: '加密货币', keywords: ['比特币', '以太坊', '加密货币', '区块链', '数字货币'] },
            { id: 'geopolitics', name: '地缘政治', keywords: ['冲突', '战争', '外交', '国际关系', '制裁'] }
        ];
        
        // 警报关键词 (中文)
        this.alertKeywords = [
            { keyword: '危机', level: 'critical' },
            { keyword: '崩盘', level: 'critical' },
            { keyword: '暴跌', level: 'critical' },
            { keyword: '紧急', level: 'critical' },
            { keyword: '警告', level: 'warning' },
            { keyword: '风险', level: 'warning' },
            { keyword: '下跌', level: 'warning' },
            { keyword: '波动', level: 'warning' },
            { keyword: '上涨', level: 'info' },
            { keyword: '突破', level: 'info' },
            { keyword: '利好', level: 'info' }
        ];
        
        // 地区检测关键词
        this.regionKeywords = {
            '美国': ['美国', '美股', '美联储', '白宫', '华盛顿'],
            '中国': ['中国', 'A股', '央行', '北京', '上海'],
            '欧洲': ['欧洲', '欧盟', '欧股', '法兰克福', '伦敦'],
            '日本': ['日本', '日股', '日经', '东京', '日本央行'],
            '全球': ['全球', '国际', '世界', '全球市场']
        };
    }
    
    // 获取新闻摘要
    async getNewsSummary() {
        const cacheKey = 'news_summary';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const newsByCategory = {};
            const alerts = [];
            
            // 并行获取各类新闻
            const promises = this.categories.map(category => 
                this.getCategoryNews(category.id)
            );
            
            const results = await Promise.all(promises);
            
            // 整理结果
            this.categories.forEach((category, index) => {
                newsByCategory[category.id] = {
                    category: category.name,
                    count: results[index].length,
                    items: results[index].slice(0, 5), // 每类显示5条
                    latest: results[index][0] || null
                };
                
                // 收集警报
                const categoryAlerts = results[index].filter(item => item.isAlert);
                alerts.push(...categoryAlerts);
            });
            
            const summary = {
                categories: newsByCategory,
                alerts: alerts.slice(0, 10), // 最多10条警报
                totalAlerts: alerts.length,
                latestUpdate: new Date().toISOString(),
                stats: {
                    totalNews: results.reduce((sum, arr) => sum + arr.length, 0),
                    alertCount: alerts.length,
                    criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
                    warningAlerts: alerts.filter(a => a.alertLevel === 'warning').length
                }
            };
            
            this.saveToCache(cacheKey, summary);
            return summary;
            
        } catch (error) {
            console.error('获取新闻摘要失败:', error);
            return this.getMockNewsData();
        }
    }
    
    // 获取分类新闻
    async getCategoryNews(categoryId) {
        const cacheKey = `news_${categoryId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            // 实际项目应调用新闻API (如GDELT、NewsAPI等)
            // 这里使用模拟数据
            const mockNews = this.generateMockNews(categoryId, 15);
            this.saveToCache(cacheKey, mockNews);
            return mockNews;
            
        } catch (error) {
            console.error(`获取${categoryId}新闻失败:`, error);
            return this.generateMockNews(categoryId, 5);
        }
    }
    
    // 搜索新闻
    async searchNews(query, options = {}) {
        const { category, limit = 20, dateRange = '24h' } = options;
        
        try {
            // 实际项目应调用搜索API
            // 这里使用模拟数据
            const allNews = [];
            
            if (category) {
                const categoryNews = await this.getCategoryNews(category);
                allNews.push(...categoryNews);
            } else {
                const promises = this.categories.map(cat => this.getCategoryNews(cat.id));
                const results = await Promise.all(promises);
                results.forEach(news => allNews.push(...news));
            }
            
            // 简单关键词匹配 (实际项目应使用更复杂的搜索)
            const filtered = allNews.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.content?.toLowerCase().includes(query.toLowerCase())
            );
            
            // 按时间排序
            filtered.sort((a, b) => b.timestamp - a.timestamp);
            
            return filtered.slice(0, limit);
            
        } catch (error) {
            console.error('搜索新闻失败:', error);
            return [];
        }
    }
    
    // 生成模拟新闻
    generateMockNews(categoryId, count = 10) {
        const category = this.categories.find(c => c.id === categoryId) || this.categories[0];
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const newsTemplates = {
            finance: [
                '美联储维持利率不变，市场预期年内降息',
                '美股三大指数集体收涨，科技股领涨',
                '财政部公布最新财政赤字数据',
                '银行股财报季来临，业绩预期分化',
                '加密货币市场大幅波动，监管政策收紧'
            ],
            politics: [
                '大选临近，两党政策主张对比',
                '外交部长出席国际会议发表讲话',
                '国会通过重要法案，影响深远',
                '地方政府选举结果出炉',
                '国际关系紧张，多方展开对话'
            ],
            tech: [
                '人工智能技术突破，应用场景扩展',
                '科技巨头发布季度财报',
                '初创公司获得新一轮融资',
                '网络安全事件引发关注',
                '新产品发布，市场反应热烈'
            ],
            markets: [
                '全球股市震荡，投资者情绪谨慎',
                '大宗商品价格波动，供需关系变化',
                '汇率市场波动，央行干预预期',
                '债券收益率曲线变化',
                '市场流动性状况分析'
            ],
            crypto: [
                '比特币突破关键阻力位',
                '加密货币监管政策更新',
                'DeFi项目安全事件',
                'NFT市场热度回升',
                '区块链技术应用拓展'
            ],
            geopolitics: [
                '地区冲突升级，国际社会关注',
                '多边会谈取得进展',
                '经济制裁影响评估',
                '国际组织发布报告',
                '全球治理挑战与机遇'
            ]
        };
        
        const templates = newsTemplates[categoryId] || newsTemplates.finance;
        
        return Array.from({ length: count }, (_, i) => {
            const titleIndex = i % templates.length;
            const title = templates[titleIndex];
            const hasAlert = Math.random() > 0.7; // 30%的新闻有警报
            const alertKeyword = hasAlert ? this.getRandomAlertKeyword() : null;
            const alertLevel = alertKeyword?.level || null;
            
            // 添加警报关键词到标题
            const finalTitle = alertKeyword 
                ? `${title} - ${alertKeyword.keyword}警报`
                : title;
            
            // 随机时间 (过去24小时内)
            const timestamp = now - Math.random() * oneDay;
            
            return {
                id: `news_${categoryId}_${i}_${Date.now()}`,
                title: finalTitle,
                content: `这是${category.name}新闻的模拟内容。${title}详细分析报告...`,
                category: categoryId,
                categoryName: category.name,
                source: this.getRandomSource(),
                timestamp: timestamp,
                date: new Date(timestamp).toISOString(),
                isAlert: hasAlert,
                alertKeyword: alertKeyword?.keyword,
                alertLevel: alertLevel,
                region: this.detectRegion(finalTitle),
                topics: this.detectTopics(finalTitle),
                importance: Math.floor(Math.random() * 5) + 1, // 1-5重要性
                read: false
            };
        }).sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序
    }
    
    // 获取随机警报关键词
    getRandomAlertKeyword() {
        const index = Math.floor(Math.random() * this.alertKeywords.length);
        return this.alertKeywords[index];
    }
    
    // 获取随机新闻源
    getRandomSource() {
        const sources = [
            '路透社', '彭博社', '华尔街日报', '金融时报', 
            'CNBC', 'BBC', '新华社', '央视新闻',
            '财新网', '第一财经', '新浪财经', '腾讯新闻'
        ];
        const index = Math.floor(Math.random() * sources.length);
        return sources[index];
    }
    
    // 检测地区
    detectRegion(text) {
        for (const [region, keywords] of Object.entries(this.regionKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return region;
            }
        }
        return '其他';
    }
    
    // 检测主题
    detectTopics(text) {
        const topics = [];
        const allKeywords = [...this.categories.flatMap(c => c.keywords), ...this.alertKeywords.map(a => a.keyword)];
        
        allKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                topics.push(keyword);
            }
        });
        
        return topics.slice(0, 3); // 最多返回3个主题
    }
    
    // 检查文本是否包含警报关键词
    containsAlertKeyword(text) {
        for (const alert of this.alertKeywords) {
            if (text.includes(alert.keyword)) {
                return alert;
            }
        }
        return null;
    }
    
    // 获取模拟新闻数据 (API失败时使用)
    getMockNewsData() {
        const newsByCategory = {};
        const alerts = [];
        
        this.categories.forEach(category => {
            const news = this.generateMockNews(category.id, 8);
            newsByCategory[category.id] = {
                category: category.name,
                count: news.length,
                items: news.slice(0, 5),
                latest: news[0] || null
            };
            
            const categoryAlerts = news.filter(item => item.isAlert);
            alerts.push(...categoryAlerts);
        });
        
        return {
            categories: newsByCategory,
            alerts: alerts.slice(0, 10),
            totalAlerts: alerts.length,
            latestUpdate: new Date().toISOString(),
            stats: {
                totalNews: this.categories.length * 8,
                alertCount: alerts.length,
                criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
                warningAlerts: alerts.filter(a => a.alertLevel === 'warning').length
            }
        };
    }
    
    // 缓存管理
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        return null;
    }
    
    saveToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    // 格式化时间
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        return `${days}天前`;
    }
    
    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 导出全局实例
window.NewsMonitor = NewsMonitor;
window.newsMonitor = new NewsMonitor();

console.log('✅ 新闻监控集成已初始化');

export default NewsMonitor;