// Vercel Serverless Function - 加密货币数据API
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
    // 模拟加密货币数据
    const now = new Date();
    const mockData = {
      cryptos: [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: '$85,432.50',
          priceRaw: 85432.50,
          change24h: 2.45,
          change7d: 8.23,
          marketCap: '$1.68T',
          volume24h: '$42.5B',
          dominance: '52.3%'
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          price: '$4,256.80',
          priceRaw: 4256.80,
          change24h: 1.23,
          change7d: 5.67,
          marketCap: '$511B',
          volume24h: '$18.2B',
          dominance: '18.5%'
        },
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          price: '$182.45',
          priceRaw: 182.45,
          change24h: -0.56,
          change7d: 12.34,
          marketCap: '$81B',
          volume24h: '$3.8B',
          dominance: '3.2%'
        },
        {
          id: 'ripple',
          symbol: 'XRP',
          name: 'Ripple',
          price: '$0.62',
          priceRaw: 0.62,
          change24h: 0.85,
          change7d: -2.34,
          marketCap: '$34B',
          volume24h: '$1.2B',
          dominance: '1.4%'
        },
        {
          id: 'cardano',
          symbol: 'ADA',
          name: 'Cardano',
          price: '$0.48',
          priceRaw: 0.48,
          change24h: 1.56,
          change7d: 3.45,
          marketCap: '$17B',
          volume24h: '$0.8B',
          dominance: '0.7%'
        },
        {
          id: 'dogecoin',
          symbol: 'DOGE',
          name: 'Dogecoin',
          price: '$0.15',
          priceRaw: 0.15,
          change24h: 0.23,
          change7d: -1.23,
          marketCap: '$21B',
          volume24h: '$1.5B',
          dominance: '0.9%'
        }
      ],
      market: {
        totalCap: '$3.21T',
        change24h: 1.85,
        btcDominance: 52.3,
        fearGreedIndex: 68,
        sentiment: 'greed'
      },
      success: true,
      timestamp: now.toISOString(),
      source: 'CoinGecko API',
      version: '2.0.0',
      updateInterval: '15分钟'
    };

    res.status(200).json(mockData);
    
  } catch (error) {
    console.error('Crypto API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
};