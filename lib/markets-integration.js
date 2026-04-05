// MJ工作室 · 市场数据集成 (基于situation-monitor项目)

class MarketsAPI {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 2 * 60 * 1000; // 2分钟缓存
        
        // 市场配置 (中文版)
        this.config = {
            indices: [
                { symbol: '^DJI', name: '道琼斯指数', display: 'DOW' },
                { symbol: '^GSPC', name: '标普500', display: 'S&P' },
                { symbol: '^IXIC', name: '纳斯达克', display: 'NDQ' },
                { symbol: '^RUT', name: '罗素2000', display: 'RUT' }
            ],
            
            sectors: [
                { symbol: 'XLK', name: '科技' },
                { symbol: 'XLF', name: '金融' },
                { symbol: 'XLE', name: '能源' },
                { symbol: 'XLV', name: '医疗' },
                { symbol: 'XLY', name: '消费' },
                { symbol: 'XLI', name: '工业' },
                { symbol: 'XLP', name: '必需消费品' },
                { symbol: 'XLU', name: '公用事业' },
                { symbol: 'XLB', name: '材料' },
                { symbol: 'XLRE', name: '房地产' },
                { symbol: 'XLC', name: '通信' },
                { symbol: 'SMH', name: '半导体' }
            ],
            
            commodities: [
                { symbol: '^VIX', name: '恐慌指数', display: 'VIX' },
                { symbol: 'GC=F', name: '黄金', display: 'GOLD' },
                { symbol: 'CL=F', name: '原油', display: 'OIL' },
                { symbol: 'NG=F', name: '天然气', display: 'NATGAS' },
                { symbol: 'SI=F', name: '白银', display: 'SILVER' },
                { symbol: 'HG=F', name: '铜', display: 'COPPER' }
            ],
            
            crypto: [
                { id: 'bitcoin', symbol: 'BTC', name: '比特币' },
                { id: 'ethereum', symbol: 'ETH', name: '以太坊' },
                { id: 'solana', symbol: 'SOL', name: 'Solana' },
                { id: 'ripple', symbol: 'XRP', name: '瑞波币' },
                { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
                { id: 'dogecoin', symbol: 'DOGE', name: '狗狗币' }
            ]
        };
        
        // 指数到ETF的映射 (免费API使用ETF代替指数)
        this.indexToETF = {
            '^DJI': 'DIA', // 道琼斯 -> SPDR道琼斯ETF
            '^GSPC': 'SPY', // 标普500 -> SPDR标普500ETF
            '^IXIC': 'QQQ', // 纳斯达克 -> Invesco QQQ
            '^RUT': 'IWM'  // 罗素2000 -> iShares罗素2000ETF
        };
    }
    
    // 获取市场数据摘要
    async getMarketSummary() {
        const cacheKey = 'market_summary';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const [indices, sectors, commodities, crypto] = await Promise.all([
                this.getIndicesData(),
                this.getSectorsData(),
                this.getCommoditiesData(),
                this.getCryptoData()
            ]);
            
            const summary = {
                indices,
                sectors,
                commodities,
                crypto,
                timestamp: new Date().toISOString(),
                marketStatus: this.getMarketStatus()
            };
            
            this.saveToCache(cacheKey, summary);
            return summary;
            
        } catch (error) {
            console.error('获取市场数据摘要失败:', error);
            return this.getMockMarketData();
        }
    }
    
    // 获取指数数据
    async getIndicesData() {
        // 使用模拟数据 (实际项目应集成Finnhub/Yahoo Finance API)
        return this.config.indices.map(index => ({
            ...index,
            price: this.getMockPrice(index.symbol),
            change: this.getMockChange(),
            changePercent: this.getMockChangePercent(),
            status: this.getPriceStatus(this.getMockChangePercent())
        }));
    }
    
    // 获取板块数据
    async getSectorsData() {
        return this.config.sectors.map(sector => ({
            ...sector,
            price: this.getMockPrice(sector.symbol),
            change: this.getMockChange(),
            changePercent: this.getMockChangePercent(),
            status: this.getPriceStatus(this.getMockChangePercent())
        }));
    }
    
    // 获取商品数据
    async getCommoditiesData() {
        return this.config.commodities.map(commodity => ({
            ...commodity,
            price: this.getMockCommodityPrice(commodity.symbol),
            change: this.getMockChange(),
            changePercent: this.getMockChangePercent(),
            status: this.getPriceStatus(this.getMockChangePercent())
        }));
    }
    
    // 获取加密货币数据
    async getCryptoData() {
        // 模拟CoinGecko API响应
        const cryptoPrices = {
            bitcoin: { usd: 85432.50, usd_24h_change: 2.45 },
            ethereum: { usd: 4256.80, usd_24h_change: 1.23 },
            solana: { usd: 182.45, usd_24h_change: -0.56 },
            ripple: { usd: 0.62, usd_24h_change: 0.85 },
            cardano: { usd: 0.48, usd_24h_change: 1.56 },
            dogecoin: { usd: 0.15, usd_24h_change: 0.23 }
        };
        
        return this.config.crypto.map(crypto => {
            const priceData = cryptoPrices[crypto.id] || { usd: 0, usd_24h_change: 0 };
            return {
                ...crypto,
                price: priceData.usd,
                change: priceData.usd_24h_change,
                changePercent: priceData.usd_24h_change,
                status: this.getPriceStatus(priceData.usd_24h_change)
            };
        });
    }
    
    // 获取市场状态
    getMarketStatus() {
        const now = new Date();
        const hour = now.getUTCHours();
        const day = now.getUTCDay(); // 0 = 周日, 1 = 周一, ...
        
        // 美股交易时间: 周一至周五 9:30-16:00 ET (13:30-20:00 UTC)
        const isWeekday = day >= 1 && day <= 5;
        const isTradingHours = hour >= 13 && hour < 20;
        
        if (!isWeekday) {
            return { open: false, status: '闭市', nextOpen: '周一 09:30 ET' };
        }
        
        if (isTradingHours) {
            return { open: true, status: '交易中', hoursLeft: 20 - hour };
        } else if (hour < 13) {
            return { open: false, status: '开盘前', nextOpen: '13:30 UTC' };
        } else {
            return { open: false, status: '收盘后', nextOpen: '明天 13:30 UTC' };
        }
    }
    
    // 获取市场情绪
    getMarketSentiment() {
        // 简单情绪分析 (实际项目应基于多个指标)
        const mockData = this.getMockMarketData();
        
        const positiveCount = [
            ...mockData.indices,
            ...mockData.sectors,
            ...mockData.commodities,
            ...mockData.crypto
        ].filter(item => item.changePercent > 0).length;
        
        const totalCount = this.config.indices.length + this.config.sectors.length + 
                          this.config.commodities.length + this.config.crypto.length;
        
        const sentimentScore = (positiveCount / totalCount) * 100;
        
        if (sentimentScore >= 70) return { score: sentimentScore, level: '极度贪婪', color: 'success' };
        if (sentimentScore >= 60) return { score: sentimentScore, level: '贪婪', color: 'warning' };
        if (sentimentScore >= 40) return { score: sentimentScore, level: '中性', color: 'neutral' };
        if (sentimentScore >= 30) return { score: sentimentScore, level: '恐惧', color: 'warning' };
        return { score: sentimentScore, level: '极度恐惧', color: 'critical' };
    }
    
    // 模拟数据生成
    getMockPrice(symbol) {
        const basePrices = {
            '^DJI': 38500, '^GSPC': 5200, '^IXIC': 16200, '^RUT': 2100,
            'XLK': 200, 'XLF': 40, 'XLE': 90, 'XLV': 140,
            'XLY': 180, 'XLI': 120, 'XLP': 75, 'XLU': 65,
            'XLB': 85, 'XLRE': 40, 'XLC': 70, 'SMH': 250,
            '^VIX': 15, 'GC=F': 2300, 'CL=F': 85, 'NG=F': 2.5,
            'SI=F': 28, 'HG=F': 4.2
        };
        
        const base = basePrices[symbol] || 100;
        const variation = (Math.random() - 0.5) * 0.02; // ±1%变化
        return base * (1 + variation);
    }
    
    getMockCommodityPrice(symbol) {
        const basePrices = {
            '^VIX': 15.5,
            'GC=F': 2350.75, // 黄金
            'CL=F': 87.42,   // 原油
            'NG=F': 2.85,    // 天然气
            'SI=F': 28.65,   // 白银
            'HG=F': 4.35     // 铜
        };
        return basePrices[symbol] || 100;
    }
    
    getMockChange() {
        return (Math.random() - 0.5) * 100;
    }
    
    getMockChangePercent() {
        return (Math.random() - 0.5) * 3; // ±1.5%
    }
    
    getPriceStatus(changePercent) {
        if (changePercent > 1) return 'bullish';
        if (changePercent < -1) return 'bearish';
        return 'neutral';
    }
    
    // 模拟市场数据 (API失败时使用)
    getMockMarketData() {
        return {
            indices: this.config.indices.map(index => ({
                ...index,
                price: this.getMockPrice(index.symbol),
                change: this.getMockChange(),
                changePercent: this.getMockChangePercent(),
                status: this.getPriceStatus(this.getMockChangePercent())
            })),
            sectors: this.config.sectors.map(sector => ({
                ...sector,
                price: this.getMockPrice(sector.symbol),
                change: this.getMockChange(),
                changePercent: this.getMockChangePercent(),
                status: this.getPriceStatus(this.getMockChangePercent())
            })),
            commodities: this.config.commodities.map(commodity => ({
                ...commodity,
                price: this.getMockCommodityPrice(commodity.symbol),
                change: this.getMockChange(),
                changePercent: this.getMockChangePercent(),
                status: this.getPriceStatus(this.getMockChangePercent())
            })),
            crypto: this.config.crypto.map(crypto => {
                const change = this.getMockChangePercent();
                return {
                    ...crypto,
                    price: crypto.symbol === 'BTC' ? 85432.50 : 
                           crypto.symbol === 'ETH' ? 4256.80 : 
                           crypto.symbol === 'SOL' ? 182.45 : 100,
                    change: change,
                    changePercent: change,
                    status: this.getPriceStatus(change)
                };
            }),
            timestamp: new Date().toISOString(),
            marketStatus: this.getMarketStatus(),
            sentiment: this.getMarketSentiment()
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
    
    // 格式化函数
    formatPrice(price) {
        if (price >= 1000) {
            return `$${price.toFixed(0)}`;
        } else if (price >= 1) {
            return `$${price.toFixed(2)}`;
        } else {
            return `$${price.toFixed(4)}`;
        }
    }
    
    formatChange(change) {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}`;
    }
    
    formatChangePercent(percent) {
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    }
}

// 导出全局实例
window.MarketsAPI = MarketsAPI;
window.marketsAPI = new MarketsAPI();

console.log('✅ 市场数据集成已初始化');

export default MarketsAPI;