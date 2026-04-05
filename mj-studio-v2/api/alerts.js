// Vercel Serverless Function - 警报系统API
module.exports = async (req, res) => {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 模拟警报数据
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    const mockData = {
      alerts: [
        {
          id: 'alert-1',
          title: '管道压力警报',
          message: 'SOFR-IORB差值达到0.00%，市场流动性处于临界状态',
          severity: 'critical',
          category: 'liquidity',
          timestamp: oneHourAgo.toISOString(),
          acknowledged: false,
          priority: 1
        },
        {
          id: 'alert-2',
          title: '投标倍数警告',
          message: '4周国债投标倍数2.6，低于市场预期3.0',
          severity: 'warning',
          category: 'auction',
          timestamp: thirtyMinutesAgo.toISOString(),
          acknowledged: false,
          priority: 2
        },
        {
          id: 'alert-3',
          message: 'SOL 24小时下跌0.56%，需关注市场情绪变化',
          severity: 'warning',
          category: 'crypto',
          timestamp: fifteenMinutesAgo.toISOString(),
          acknowledged: false,
          priority: 2
        },
        {
          id: 'alert-4',
          title: '数据更新延迟',
          message: 'TreasuryDirect数据更新延迟，当前使用缓存数据',
          severity: 'info',
          category: 'system',
          timestamp: now.toISOString(),
          acknowledged: true,
          priority: 3
        },
        {
          id: 'alert-5',
          title: 'FRED API连接正常',
          message: 'FRED API连接稳定，数据更新正常',
          severity: 'info',
          category: 'system',
          timestamp: now.toISOString(),
          acknowledged: true,
          priority: 3
        }
      ],
      summary: {
        total: 5,
        critical: 1,
        warning: 2,
        info: 2,
        unacknowledged: 3,
        lastAlert: now.toISOString()
      },
      success: true,
      timestamp: now.toISOString(),
      version: '2.0.0',
      system: 'Logos哨兵警报系统'
    };

    res.status(200).json(mockData);
    
  } catch (error) {
    console.error('Alerts API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
};