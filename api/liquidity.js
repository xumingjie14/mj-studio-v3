// Vercel Serverless Function - 流动性数据API
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 这里可以集成真实的FRED API
    // 使用环境变量中的FRED_API_KEY
    const fredApiKey = process.env.FRED_API_KEY || 'demo';
    
    // 模拟数据（实际开发中替换为真实API调用）
    const dxy = 104.50; // 美元指数
    const netLiquidity = 5827625.673; // WALCL - WTREGEN - RRPONTSYD
    const adjustedLiquidity = netLiquidity / dxy; // 新公式: (WALCL-TGA-RRP)/DXY
    
    const mockData = {
      sofr: 3.65,
      iorb: 3.65,
      walcl: 6675344,
      wtregen: 847718.0,
      rrpartsyd: 0.327,
      dxy: dxy,
      netLiquidity: netLiquidity,
      adjustedLiquidity: adjustedLiquidity,
      pipePressure: 0.00,
      lastUpdated: new Date().toISOString(),
      status: 'critical',
      formulas: {
        netLiquidity: 'WALCL - WTREGEN - RRPONTSYD',
        pipePressure: 'SOFR - IORB',
        adjustedLiquidity: '(WALCL - WTREGEN - RRPONTSYD) / DXY'
      },
      alerts: [{
        id: '1',
        title: '管道压力警报',
        severity: 'critical',
        message: 'SOFR-IORB差值达到0.00%，市场流动性处于临界状态',
        timestamp: new Date().toISOString()
      }],
      success: true,
      timestamp: new Date().toISOString(),
      source: 'FRED API',
      version: '2.0.0',
      project: 'MJ工作室 · Logos哨兵终端'
    };

    // 返回数据
    res.status(200).json(mockData);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false
    });
  }
};