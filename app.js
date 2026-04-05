// MJ工作室 · Logos哨兵终端 v2.0 - 主应用逻辑

class LogosSentinel {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin,
            updateInterval: 30000, // 30秒
            simulateData: true,    // 确保使用模拟数据
            version: '2.0.0'
        };
        
        this.state = {
            liquidityData: null,
            auctionData: null,
            cryptoData: null,
            alerts: [],
            lastUpdate: null,
            systemStatus: 'online'
        };
        
        this.init();
    }
    
    // 初始化应用
    init() {
        console.log(`🚀 MJ工作室 · Logos哨兵终端 v${this.config.version} 启动`);
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 初始数据加载
        this.loadAllData();
        
        // 启动定时更新
        this.startAutoUpdate();
        
        // 系统就绪
        this.markSystemReady();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 面板点击效果
        document.querySelectorAll('.panel').forEach(panel => {
            panel.addEventListener('click', () => {
                this.animatePanelClick(panel);
            });
        });
        
        // 警报点击处理
        document.addEventListener('click', (e) => {
            if (e.target.closest('.alert-item')) {
                this.handleAlertClick(e.target.closest('.alert-item'));
            }
        });
    }
    
    // 加载所有数据
    async loadAllData() {
        try {
            console.log('📊 开始加载监控数据...');
            
            // 并行加载所有数据
            await Promise.all([
                this.loadLiquidityData(),
                this.loadAuctionData(),
                this.loadCryptoData(),
                this.loadAlerts()
            ]);
            
            this.state.lastUpdate = new Date();
            this.updateLastUpdateTime();
            
            console.log('✅ 所有数据加载完成');
        } catch (error) {
            console.error('❌ 数据加载失败:', error);
            this.showErrorMessage('数据加载失败，使用模拟数据继续运行');
            // 使用模拟数据继续运行
            this.loadMockData();
        }
    }
    
    // 加载流动性数据
    async loadLiquidityData() {
        try {
            let data;
            
            if (this.config.simulateData) {
                // 模拟数据
                data = this.generateMockLiquidityData();
            } else {
                // 实际API调用
                const response = await fetch(`${this.config.apiBaseUrl}/api/liquidity`);
                if (!response.ok) throw new Error(`API响应错误: ${response.status}`);
                data = await response.json();
            }
            
            this.state.liquidityData = data;
            this.renderLiquidityData(data);
            
        } catch (error) {
            console.error('流动性数据加载失败:', error);
            // 使用模拟数据作为后备
            const mockData = this.generateMockLiquidityData();
            this.state.liquidityData = mockData;
            this.renderLiquidityData(mockData);
        }
    }
    
    // 加载拍卖数据
    async loadAuctionData() {
        try {
            let data;
            
            if (this.config.simulateData) {
                data = this.generateMockAuctionData();
            } else {
                // 实际API调用
                const response = await fetch(`${this.config.apiBaseUrl}/api/auctions`);
                if (!response.ok) throw new Error(`API响应错误: ${response.status}`);
                data = await response.json();
            }
            
            this.state.auctionData = data;
            this.renderAuctionData(data);
            
        } catch (error) {
            console.error('拍卖数据加载失败:', error);
            const mockData = this.generateMockAuctionData();
            this.state.auctionData = mockData;
            this.renderAuctionData(mockData);
        }
    }
    
    // 加载加密货币数据
    async loadCryptoData() {
        try {
            let data;
            
            if (this.config.simulateData) {
                data = this.generateMockCryptoData();
            } else {
                // 实际API调用
                const response = await fetch(`${this.config.apiBaseUrl}/api/crypto`);
                if (!response.ok) throw new Error(`API响应错误: ${response.status}`);
                data = await response.json();
            }
            
            this.state.cryptoData = data;
            this.renderCryptoData(data);
            
        } catch (error) {
            console.error('加密货币数据加载失败:', error);
            const mockData = this.generateMockCryptoData();
            this.state.cryptoData = mockData;
            this.renderCryptoData(mockData);
        }
    }
    
    // 加载警报数据
    async loadAlerts() {
        try {
            let data;
            
            if (this.config.simulateData) {
                data = this.generateMockAlerts();
            } else {
                // 实际API调用
                const response = await fetch(`${this.config.apiBaseUrl}/api/alerts`);
                if (!response.ok) throw new Error(`API响应错误: ${response.status}`);
                data = await response.json();
            }
            
            this.state.alerts = data;
            this.renderAlerts(data);
            
        } catch (error) {
            console.error('警报数据加载失败:', error);
            const mockData = this.generateMockAlerts();
            this.state.alerts = mockData;
            this.renderAlerts(mockData);
        }
    }
    
    // 加载模拟数据（完全后备）
    loadMockData() {
        console.log('🔄 加载完整模拟数据...');
        
        const liquidityData = this.generateMockLiquidityData();
        const auctionData = this.generateMockAuctionData();
        const cryptoData = this.generateMockCryptoData();
        const alertsData = this.generateMockAlerts();
        
        this.state.liquidityData = liquidityData;
        this.state.auctionData = auctionData;
        this.state.cryptoData = cryptoData;
        this.state.alerts = alertsData;
        
        this.renderLiquidityData(liquidityData);
        this.renderAuctionData(auctionData);
        this.renderCryptoData(cryptoData);
        this.renderAlerts(alertsData);
        
        this.state.lastUpdate = new Date();
        this.updateLastUpdateTime();
    }
    
    // 渲染流动性数据
    renderLiquidityData(data) {
        // 更新管道压力
        const pipePressureElement = document.getElementById('pipe-pressure');
        if (pipePressureElement) {
            pipePressureElement.textContent = `${data.pipePressure >= 0 ? '+' : ''}${data.pipePressure.toFixed(2)}%`;
            pipePressureElement.className = `metric-value ${data.pipePressure >= 0 ? 'critical' : 'success'}`;
        }
        
        // 更新净流动性
        const netLiquidityElement = document.getElementById('net-liquidity');
        if (netLiquidityElement) {
            const trillion = data.netLiquidity / 1000000;
            netLiquidityElement.textContent = `$${trillion.toFixed(2)}T`;
        }
        
        // 更新SOFR
        const sofrElement = document.getElementById('sofr-value');
        if (sofrElement) {
            sofrElement.textContent = `${data.sofr.toFixed(2)}%`;
        }
        
        // 更新IORB
        const iorbElement = document.getElementById('iorb-value');
        if (iorbElement) {
            iorbElement.textContent = `${data.iorb.toFixed(2)}%`;
        }
        
        // 更新状态徽章
        const statusElement = document.getElementById('liquidity-status');
        if (statusElement) {
            if (data.pipePressure >= 0) {
                statusElement.textContent = '🚨 爆管警报';
                statusElement.className = 'panel-badge critical';
            } else if (data.pipePressure >= -0.1) {
                statusElement.textContent = '⚠️ 管道压力';
                statusElement.className = 'panel-badge warning';
            } else {
                statusElement.textContent = '✅ 管道安全';
                statusElement.className = 'panel-badge success';
            }
        }
        
        // 更新进度条
        const progressBar = document.querySelector('.progress-bar.critical');
        if (progressBar) {
            const width = Math.min(Math.abs(data.pipePressure) * 100, 100);
            progressBar.style.width = `${width}%`;
        }
        
        // 更新数据源时间
        const updateElement = document.getElementById('liquidity-update');
        if (updateElement) {
            updateElement.textContent = this.formatTimeAgo(data.timestamp);
        }
    }
    
    // 渲染拍卖数据
    renderAuctionData(data) {
        const auctionListElement = document.getElementById('auction-list');
        if (!auctionListElement) return;
        
        if (data.auctions && data.auctions.length > 0) {
            auctionListElement.innerHTML = data.auctions.map(auction => `
                <div class="auction-item">
                    <div class="auction-info">
                        <div class="auction-name">${auction.name}</div>
                        <div class="auction-multiple">投标倍数: ${auction.bidToCover}</div>
                    </div>
                    <div class="auction-amount">${auction.amount}</div>
                </div>
            `).join('');
        } else {
            auctionListElement.innerHTML = '<div class="loading">暂无拍卖数据</div>';
        }
        
        // 更新状态徽章
        const statusElement = document.getElementById('auction-status');
        if (statusElement && data.auctions) {
            statusElement.textContent = `⚠️ 今日${data.auctions.length}场`;
        }
        
        // 更新数据源时间
        const updateElement = document.getElementById('auction-update');
        if (updateElement) {
            updateElement.textContent = this.formatTimeAgo(data.timestamp);
        }
    }
    
    // 渲染加密货币数据
    renderCryptoData(data) {
        const cryptoGridElement = document.getElementById('crypto-grid');
        if (!cryptoGridElement) return;
        
        if (data.cryptos && data.cryptos.length > 0) {
            cryptoGridElement.innerHTML = data.cryptos.map(crypto => `
                <div class="crypto-item">
                    <div class="crypto-symbol">${crypto.symbol}</div>
                    <div class="crypto-price">${crypto.price}</div>
                    <div class="crypto-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
                        ${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%
                    </div>
                </div>
            `).join('');
        } else {
            cryptoGridElement.innerHTML = '<div class="loading">暂无加密货币数据</div>';
        }
        
        // 更新状态徽章
        const statusElement = document.getElementById('crypto-status');
        if (statusElement) {
            const hasNegative = data.cryptos?.some(c => c.change < -2);
            const hasPositive = data.cryptos?.some(c => c.change > 2);
            
            if (hasNegative) {
                statusElement.textContent = '⚠️ 市场波动';
                statusElement.className = 'panel-badge warning';
            } else if (hasPositive) {
                statusElement.textContent = '📈 市场上涨';
                statusElement.className = 'panel-badge success';
            } else {
                statusElement.textContent = '✅ 市场稳定';
                statusElement.className = 'panel-badge success';
            }
        }
        
        // 更新数据源时间
        const updateElement = document.getElementById('crypto-update');
        if (updateElement) {
            updateElement.textContent = this.formatTimeAgo(data.timestamp);
        }
    }
    
    // 渲染警报数据
    renderAlerts(data) {
        const alertListElement = document.getElementById('alert-list');
        if (!alertListElement) return;
        
        if (data.alerts && data.alerts.length > 0) {
            alertListElement.innerHTML = data.alerts.map(alert => `
                <div class="alert-item ${alert.severity}">
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-message">${alert.message}</div>
                    </div>
                    <div class="alert-time">${this.formatTimeAgo(alert.timestamp)}</div>
                </div>
            `).join('');
        } else {
            alertListElement.innerHTML = '<div class="loading">暂无警报</div>';
        }
        
        // 更新统计
        const criticalCount = data.alerts?.filter(a => a.severity === 'critical').length || 0;
        const warningCount = data.alerts?.filter(a => a.severity === 'warning').length || 0;
        const totalCount = data.alerts?.length || 0;
        
        document.getElementById('critical-count').textContent = criticalCount;
        document.getElementById('warning-count').textContent = warningCount;
        document.getElementById('pending-count').textContent = totalCount;
        
        // 更新全局警报
        const globalAlert = data.alerts?.find(a => a.severity === 'critical');
        if (globalAlert) {
            const globalAlertElement = document.getElementById('global-alert');
            if (globalAlertElement) {
                document.querySelector('.alert-title').textContent = globalAlert.title;
                document.querySelector('.alert-message').textContent = globalAlert.message;
                document.getElementById('alert-time').textContent = this.formatTimeAgo(globalAlert.timestamp);
            }
        }
    }
    
    // 生成模拟流动性数据
    generateMockLiquidityData() {
        const now = new Date();
        const pipePressure = 0.00; // 模拟爆管警报
        
        return {
            sofr: 3.65,
            iorb: 3.65,
            walcl: 6675344,
            wtregen: 847718.0,
            rrpartsyd: 0.327,
            netLiquidity: 5827625.673,
            pipePressure: pipePressure,
            status: pipePressure >= 0 ? 'critical' : 'safe',
            timestamp: now.toISOString(),
            formulas: {
                netLiquidity: 'WALCL - WTREGEN - RRPONTSYD',
                pipePressure: 'SOFR - IORB'
            }
        };
    }
    
    // 生成模拟拍卖数据
    generateMockAuctionData() {
        const now = new Date();
        
        return {
            auctions: [
                {
                    name: '4周国债',
                    amount: '$45B',
                    bidToCover: '2.6',
                    date: now.toISOString()
                },
                {
                    name: '8周国债',
                    amount: '$42B',
                    bidToCover: '2.8',
                    date: now.toISOString()
                },
                {
                    name: '13周国债',
                    amount: '$58B',
                    bidToCover: '3.1',
                    date: now.toISOString()
                }
            ],
            timestamp: now.toISOString(),
            source: 'TreasuryDirect'
        };
    }
    
    // 生成模拟加密货币数据
    generateMockCryptoData() {
        const now = new Date();
        
        return {
            cryptos: [
                {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    price: '$85,432.50',
                    change: 2.45,
                    marketCap: '$1.68T'
                },
                {
                    symbol: 'ETH',
                    name: 'Ethereum',
                    price: '$4,256.80',
                    change: 1.23,
                    marketCap: '$511B'
                },
                {
                    symbol: 'SOL',
                    name: 'Solana',
                    price: '$182.45',
                    change: -0.56,
                    marketCap: '$81B'
                },
                {
                    symbol: 'XRP',
                    name: 'Ripple',
                    price: '$0.62',
                    change: 0.85,
                    marketCap: '$34B'
                }
            ],
            timestamp: now.toISOString(),
            source: 'CoinGecko API'
        };
    }
    
    // 生成模拟警报
    generateMockAlerts() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        
        return {
            alerts: [
                {
                    id: 'alert-1',
                    title: '管道压力警报',
                    message: 'SOFR-IORB差值达到0.00%，市场流动性处于临界状态',
                    severity: 'critical',
                    category: 'liquidity',
                    timestamp: oneHourAgo.toISOString()
                },
                {
                    id: 'alert-2',
                    title: '投标倍数警告',
                    message: '4周国债投标倍数2.6，低于市场预期',
                    severity: 'warning',
                    category: 'auction',
                    timestamp: thirtyMinutesAgo.toISOString()
                },
                {
                    id: 'alert-3',
                    title: '加密货币波动',
                    message: 'SOL 24小时下跌0.56%，需关注市场情绪',
                    severity: 'warning',
                    category: 'crypto',
                    timestamp: now.toISOString()
                }
            ],
            timestamp: now.toISOString()
        };
    }
    
    // 启动自动更新
    startAutoUpdate() {
        setInterval(() => {
            this.loadAllData();
        }, this.config.updateInterval);
        
        console.log(`🔄 自动更新已启动，间隔: ${this.config.updateInterval / 1000}秒`);
    }
    
    // 更新最后更新时间
    updateLastUpdateTime() {
        const elements = document.querySelectorAll('.data-source span');
        elements.forEach(element => {
            if (element.id.includes('update')) {
                element.textContent = '刚刚';
            }
        });
        
        // 3秒后恢复
        setTimeout(() => {
            elements.forEach(element => {
                if (element.id.includes('update')) {
                    const type = element.id.replace('-update', '');
                    element.textContent = type === 'liquidity' ?// 完成app.js文件
                    element.textContent = type === 'liquidity' ? '实时' : 
                                        type === 'auction' ? '30分钟前' : 
                                        '15分钟前';
                }
            });
        }, 3000);
    }
    
    // 格式化时间间隔
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}小时前`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}天前`;
    }
    
    // 面板点击动画
    animatePanelClick(panel) {
        panel.style.transform = 'translateY(-4px) scale(1.02)';
        panel.style.boxShadow = '0 12px 40px rgba(255, 107, 0, 0.3)';
        
        setTimeout(() => {
            panel.style.transform = 'translateY(-2px)';
            panel.style.boxShadow = '0 8px 25px rgba(255, 107, 0, 0.2)';
        }, 200);
    }
    
    // 处理警报点击
    handleAlertClick(alertElement) {
        const alertId = alertElement.dataset.id;
        console.log('警报点击:', alertId);
        
        // 添加点击反馈
        alertElement.style.opacity = '0.8';
        setTimeout(() => {
            alertElement.style.opacity = '1';
        }, 200);
        
        // 这里可以添加警报详情查看逻辑
    }
    
    // 显示错误消息
    showErrorMessage(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-alert warning';
        errorDiv.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">系统提示</div>
                <div class="alert-message">${message}</div>
            </div>
        `;
        
        // 插入到页面
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            
            // 5秒后自动移除
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
    
    // 标记系统就绪
    markSystemReady() {
        document.body.classList.add('system-ready');
        
        // 添加就绪动画
        const panels = document.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                panel.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        console.log('✅ 系统就绪，所有功能已加载');
    }
    
    // 手动刷新数据
    refreshData() {
        console.log('手动刷新数据...');
        this.loadAllData();
        
        // 显示刷新提示
        this.showErrorMessage('正在刷新数据...');
    }
}

// 应用初始化
window.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例
    window.logosSentinel = new LogosSentinel();
    
    // 添加全局刷新快捷键 (Ctrl+R 或 Cmd+R)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            window.logosSentinel.refreshData();
        }
    });
    
    // 添加右键菜单刷新选项
    document.addEventListener('contextmenu', (e) => {
        // 可以在这里添加上下文菜单
    }, false);
});

// 导出全局函数
window.refreshLogosData = function() {
    if (window.logosSentinel) {
        window.logosSentinel.refreshData();
    }
};

// 系统信息
console.log('⚙️ MJ工作室 · Logos哨兵终端 v2.0');
console.log('📊 宏观流动性监控系统');
console.log('🚀 技术栈: Vanilla JS + Vercel Serverless');
console.log('🌐 部署平台: Vercel');
console.log('© 2026 MJ工作室 · 数据驱动决策');
