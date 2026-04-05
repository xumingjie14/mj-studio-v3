// MJ工作室 · FRED API集成 (基于situation-monitor项目)
// 将Svelte/TypeScript代码转换为Vanilla JavaScript

class FredAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.FRED_API_KEY || '';
        this.baseUrl = 'https://api.stlouisfed.org/fred';
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5分钟缓存
    }
    
    // 检查API密钥是否配置
    isConfigured() {
        return this.apiKey && this.apiKey.length > 0;
    }
    
    // 获取系列数据
    async getSeries(seriesId, options = {}) {
        const cacheKey = `series_${seriesId}_${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const params = new URLSearchParams({
                series_id: seriesId,
                api_key: this.apiKey,
                file_type: 'json',
                ...options
            });
            
            const url = `${this.baseUrl}/series/observations?${params}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`FRED API错误: ${response.status}`);
            }
            
            const data = await response.json();
            this.saveToCache(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error(`获取FRED系列 ${seriesId} 失败:`, error);
            return this.createEmptySeriesResponse(seriesId);
        }
    }
    
    // 获取多个系列
    async getMultipleSeries(seriesList) {
        const promises = seriesList.map(series => this.getSeries(series.id, series.options));
        const results = await Promise.all(promises);
        
        return seriesList.reduce((acc, series, index) => {
            acc[series.id] = results[index];
            return acc;
        }, {});
    }
    
    // 获取最新值
    async getLatestValue(seriesId) {
        const data = await this.getSeries(seriesId, {
            limit: 1,
            sort_order: 'desc'
        });
        
        if (data.observations && data.observations.length > 0) {
            const latest = data.observations[0];
            return {
                value: parseFloat(latest.value),
                date: latest.date,
                seriesId: seriesId
            };
        }
        
        return { value: null, date: null, seriesId: seriesId };
    }
    
    // 获取流动性相关指标
    async getLiquidityIndicators() {
        const indicators = [
            { id: 'WALCL', name: '美联储总资产', unit: '百万美元' },
            { id: 'WTREGEN', name: '财政部一般账户', unit: '百万美元' },
            { id: 'RRPONTSYD', name: '隔夜逆回购', unit: '十亿美元' },
            { id: 'SOFR', name: '担保隔夜融资利率', unit: '百分比' },
            { id: 'IORB', name: '准备金余额利率', unit: '百分比' },
            { id: 'DXY', name: '美元指数', unit: '指数' }
        ];
        
        const promises = indicators.map(indicator => this.getLatestValue(indicator.id));
        const results = await Promise.all(promises);
        
        return indicators.reduce((acc, indicator, index) => {
            acc[indicator.id] = {
                ...indicator,
                value: results[index].value,
                date: results[index].date,
                formattedValue: this.formatValue(results[index].value, indicator.unit)
            };
            return acc;
        }, {});
    }
    
    // 计算流动性指标
    async calculateLiquidityMetrics() {
        const indicators = await this.getLiquidityIndicators();
        
        // 净流动性 = WALCL - WTREGEN - RRPONTSYD
        const walcl = indicators.WALCL.value || 0;
        const wtregen = indicators.WTREGEN.value || 0;
        const rrpartsyd = (indicators.RRPONTSYD.value || 0) * 1000; // 转换为百万美元
        const dxy = indicators.DXY.value || 100;
        
        const netLiquidity = walcl - wtregen - rrpartsyd;
        const adjustedLiquidity = dxy ? netLiquidity / dxy : netLiquidity;
        const pipePressure = (indicators.SOFR.value || 0) - (indicators.IORB.value || 0);
        
        return {
            indicators,
            metrics: {
                netLiquidity: {
                    value: netLiquidity,
                    formatted: this.formatCurrency(netLiquidity, '百万美元')
                },
                adjustedLiquidity: {
                    value: adjustedLiquidity,
                    formatted: this.formatCurrency(adjustedLiquidity, '百万美元')
                },
                pipePressure: {
                    value: pipePressure,
                    formatted: `${pipePressure >= 0 ? '+' : ''}${pipePressure.toFixed(2)}%`
                },
                sofr: indicators.SOFR.value,
                iorb: indicators.IORB.value,
                dxy: indicators.DXY.value
            },
            formulas: {
                netLiquidity: 'WALCL - WTREGEN - RRPONTSYD',
                adjustedLiquidity: '(WALCL - WTREGEN - RRPONTSYD) / DXY',
                pipePressure: 'SOFR - IORB'
            },
            timestamp: new Date().toISOString()
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
    
    // 工具函数
    formatValue(value, unit) {
        if (value === null || value === undefined) return 'N/A';
        
        switch (unit) {
            case '百万美元':
                return `$${(value / 1000).toFixed(1)}B`;
            case '十亿美元':
                return `$${value.toFixed(1)}B`;
            case '百分比':
                return `${value.toFixed(2)}%`;
            case '指数':
                return value.toFixed(2);
            default:
                return value.toString();
        }
    }
    
    formatCurrency(value, unit) {
        if (value === null || value === undefined) return 'N/A';
        
        if (Math.abs(value) >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}T`;
        } else if (Math.abs(value) >= 1000) {
            return `$${(value / 1000).toFixed(1)}B`;
        } else {
            return `$${value.toFixed(0)}M`;
        }
    }
    
    createEmptySeriesResponse(seriesId) {
        return {
            observations: [],
            seriesId: seriesId,
            error: true,
            message: '无法获取数据'
        };
    }
}

// 导出全局实例
window.FredAPI = FredAPI;

// 如果环境中有FRED_API_KEY，自动创建实例
if (typeof window !== 'undefined') {
    const fredApiKey = window.FRED_API_KEY || process.env.FRED_API_KEY;
    if (fredApiKey) {
        window.fredAPI = new FredAPI(fredApiKey);
        console.log('✅ FRED API集成已初始化');
    } else {
        console.warn('⚠️ FRED_API_KEY未配置，使用模拟数据');
    }
}

export default FredAPI;