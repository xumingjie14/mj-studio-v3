// Vercel Serverless Function - 拍卖数据API
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
    // 模拟拍卖数据
    const now = new Date();
    const mockData = {
      auctions: [
        {
          id: 'auction-1',
          name: '4周国债',
          amount: '$45B',
          bidToCover: '2.6',
          date: now.toISOString(),
          status: 'completed',
          yield: '3.45%'
        },
        {
          id: 'auction-2',
          name: '8周国债',
          amount: '$42B',
          bidToCover: '2.8',
          date: now.toISOString(),
          status: 'completed',
          yield: '3.52%'
        },
        {
          id: 'auction-3',
          name: '13周国债',
          amount: '$58B',
          bidToCover: '3.1',
          date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          yield: '3.65%'
        },
        {
          id: 'auction-4',
          name: '26周国债',
          amount: '$52B',
          bidToCover: '3.3',
          date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          yield: '3.78%'
        }
      ],
      summary: {
        totalToday: 2,
        totalUpcoming: 2,
        averageBidToCover: 2.95,
        lastUpdate: now.toISOString()
      },
      success: true,
      timestamp: now.toISOString(),
      source: 'TreasuryDirect',
      version: '2.0.0'
    };

    res.status(200).json(mockData);
    
  } catch (error) {
    console.error('Auctions API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
};