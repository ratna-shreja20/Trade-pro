"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart , ArrowUpRight, ArrowDownRight, X, Plus, Minus, LineChart, BarChart, CandlestickChart, Settings } from 'lucide-react';

type Stock = {
  id: string;
  name: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  quantity: number;
  avgBuyPrice: number;
  priceHistory: number[];
  dailyData: {
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
};

type Transaction = {
  id: string;
  stockId: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  date: Date;
};

type AnalyticsMetric = {
  id: string;
  name: string;
  enabled: boolean;
};

type CandlestickPattern = {
  name: string;
  index: number;
  bullish: boolean;
};

const generateDailyData = (basePrice: number, days: number) => {
  return Array.from({length: days}, () => {
    const open = basePrice + Math.random() * 200 - 100;
    const close = open + (Math.random() * 100 - 50);
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    return { open, high, low, close };
  });
};

const generateStocks = (): Stock[] => [
  { 
    id: '1', 
    name: 'Reliance', 
    currentPrice: 2456.75, 
    change: 12.5, 
    percentChange: 0.51, 
    quantity: 0, 
    avgBuyPrice: 0,
    priceHistory: Array.from({length: 30}, () => 2400 + Math.random() * 200 - 100),
    dailyData: generateDailyData(2400, 30)
  },
  { 
    id: '2', 
    name: 'TCS', 
    currentPrice: 3456.25, 
    change: -23.4, 
    percentChange: -0.67, 
    quantity: 0, 
    avgBuyPrice: 0,
    priceHistory: Array.from({length: 30}, () => 3400 + Math.random() * 200 - 100),
    dailyData: generateDailyData(3400, 30)
  },
  { 
    id: '3', 
    name: 'HDFC Bank', 
    currentPrice: 1456.80, 
    change: 8.2, 
    percentChange: 0.57, 
    quantity: 0, 
    avgBuyPrice: 0,
    priceHistory: Array.from({length: 30}, () => 1400 + Math.random() * 200 - 100),
    dailyData: generateDailyData(1400, 30)
  },
  { 
    id: '4', 
    name: 'Infosys', 
    currentPrice: 1520.50, 
    change: -15.3, 
    percentChange: -1.0, 
    quantity: 0, 
    avgBuyPrice: 0,
    priceHistory: Array.from({length: 30}, () => 1500 + Math.random() * 200 - 100),
    dailyData: generateDailyData(1500, 30)
  },
];

const availableMetrics: AnalyticsMetric[] = [
  { id: 'ma5', name: '5-Day MA', enabled: true },
  { id: 'ma10', name: '10-Day MA', enabled: true },
  { id: 'volatility', name: 'Volatility', enabled: true },
  { id: 'rsi', name: 'RSI (14)', enabled: true },
  { id: 'volume', name: 'Volume', enabled: false },
  { id: 'macd', name: 'MACD', enabled: false },
  { id: 'patterns', name: 'Candlestick Patterns', enabled: true },
];

const detectCandlestickPatterns = (dailyData: Stock['dailyData']): CandlestickPattern[] => {
  const patterns: CandlestickPattern[] = [];
  
  for (let i = 2; i < dailyData.length; i++) {
    const today = dailyData[i];
    const yesterday = dailyData[i-1];
    const dayBefore = dailyData[i-2];
    
    const todayBody = Math.abs(today.close - today.open);
    const yesterdayBody = Math.abs(yesterday.close - yesterday.open);
    
    const todayUpperShadow = today.high - Math.max(today.open, today.close);
    const todayLowerShadow = Math.min(today.open, today.close) - today.low;
    
   // const _yesterdayUpperShadow = yesterday.high - Math.max(yesterday.open, yesterday.close);
    //const _yesterdayLowerShadow = Math.min(yesterday.open, yesterday.close) - yesterday.low;
    
    
    if (todayLowerShadow >= 2 * todayBody && todayUpperShadow <= todayBody * 0.3) {
      patterns.push({
        name: today.close > today.open ? 'Hammer (Bullish)' : 'Hanging Man (Bearish)',
        index: i,
        bullish: today.close > today.open
      });
    }
    
    
    if (todayUpperShadow >= 2 * todayBody && todayLowerShadow <= todayBody * 0.3) {
      patterns.push({
        name: today.close > today.open ? 'Inverted Hammer (Bullish)' : 'Shooting Star (Bearish)',
        index: i,
        bullish: today.close > today.open
      });
    }
    
    
    if (todayBody <= (today.high - today.low) * 0.1) {
      patterns.push({
        name: 'Doji (Neutral)',
        index: i,
        bullish: false 
      });
    }
    
   
    if (yesterdayBody > 0) {
      const isBullishEngulfing = today.close > today.open && 
                                yesterday.close < yesterday.open && 
                                today.open < yesterday.close && 
                                today.close > yesterday.open;
      
      const isBearishEngulfing = today.close < today.open && 
                                yesterday.close > yesterday.open && 
                                today.open > yesterday.close && 
                                today.close < yesterday.open;
      
      if (isBullishEngulfing) {
        patterns.push({
          name: 'Bullish Engulfing',
          index: i,
          bullish: true
        });
      }
      
      if (isBearishEngulfing) {
        patterns.push({
          name: 'Bearish Engulfing',
          index: i,
          bullish: false
        });
      }
    }
    
   
    if (i >= 2) {
      const isMorningStar = dayBefore.close < dayBefore.open && 
                          Math.abs(yesterday.close - yesterday.open) <= (yesterday.high - yesterday.low) * 0.3 &&
                          today.close > today.open && 
                          today.open > yesterday.close;
      
      const isEveningStar = dayBefore.close > dayBefore.open && 
                          Math.abs(yesterday.close - yesterday.open) <= (yesterday.high - yesterday.low) * 0.3 &&
                          today.close < today.open && 
                          today.open < yesterday.close;
      
      if (isMorningStar) {
        patterns.push({
          name: 'Morning Star (Bullish)',
          index: i,
          bullish: true
        });
      }
      
      if (isEveningStar) {
        patterns.push({
          name: 'Evening Star (Bearish)',
          index: i,
          bullish: false
        });
      }
    }
  }
  
  return patterns;
};

export default function PortfolioSimulator() {
  const [stocks, setStocks] = useState<Stock[]>(generateStocks());
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cashBalance, setCashBalance] = useState(100000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'dashboard'>('portfolio');
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>(availableMetrics);
  const [showMetricsSettings, setShowMetricsSettings] = useState(false);
  const [detectedPatterns, setDetectedPatterns] = useState<CandlestickPattern[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => prevStocks.map(stock => {
        const change = (Math.random() * 20 - 10);
        const newPrice = stock.currentPrice + change;
        const percentChange = (change / stock.currentPrice) * 100;
        
        // Update daily data - shift array and add new day
        const newDailyData = [...stock.dailyData.slice(1)];
        const lastClose = newDailyData[newDailyData.length - 1].close;
        newDailyData.push({
          open: lastClose,
          close: newPrice,
          high: Math.max(lastClose, newPrice) + Math.random() * 10,
          low: Math.min(lastClose, newPrice) - Math.random() * 10
        });
        
        return {
          ...stock,
          currentPrice: newPrice,
          change: change,
          percentChange: percentChange,
          priceHistory: [...stock.priceHistory.slice(1), newPrice],
          dailyData: newDailyData
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const value = stocks.reduce((total, stock) => {
      return total + (stock.currentPrice * stock.quantity);
    }, 0);
    setPortfolioValue(value);
  }, [stocks]);

  useEffect(() => {
    if (selectedStock && activeTab === 'dashboard') {
      const patterns = detectCandlestickPatterns(selectedStock.dailyData);
      setDetectedPatterns(patterns);
    } else {
      setDetectedPatterns([]);
    }
  }, [selectedStock, activeTab]);

  const executeTrade = (type: 'buy' | 'sell') => {
    if (!selectedStock || quantity <= 0) return;

    const stock = stocks.find(s => s.id === selectedStock.id);
    if (!stock) return;

    const totalCost = selectedStock.currentPrice * quantity;

    if (type === 'buy' && cashBalance < totalCost) {
      alert('Insufficient funds!');
      return;
    }

    if (type === 'sell' && stock.quantity < quantity) {
      alert('Not enough shares to sell!');
      return;
    }

    const updatedStocks = stocks.map(s => {
      if (s.id === selectedStock.id) {
        const newQuantity = type === 'buy' 
          ? s.quantity + quantity 
          : s.quantity - quantity;
        
        const newAvgPrice = type === 'buy'
          ? ((s.avgBuyPrice * s.quantity) + (selectedStock.currentPrice * quantity)) / (s.quantity + quantity)
          : s.avgBuyPrice; 

        return {
          ...s,
          quantity: newQuantity,
          avgBuyPrice: newAvgPrice
        };
      }
      return s;
    });

    const newCashBalance = type === 'buy'
      ? cashBalance - totalCost
      : cashBalance + totalCost;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      stockId: selectedStock.id,
      type,
      price: selectedStock.currentPrice,
      quantity,
      date: new Date()
    };

    setStocks(updatedStocks);
    setCashBalance(newCashBalance);
    setTransactions([...transactions, newTransaction]);
    setSelectedStock(null);
    setQuantity(1);
  };

  const calculateProfitLoss = (stock: Stock): number => {
    if (stock.quantity === 0) return 0;
    return (stock.currentPrice - stock.avgBuyPrice) * stock.quantity;
  };

  const portfolioAllocation = stocks
    .filter(stock => stock.quantity > 0)
    .map(stock => ({
      name: stock.name,
      value: stock.currentPrice * stock.quantity,
      color: getStockColor(stock.id)
    }));

  const calculateMovingAverage = (prices: number[], days: number): number[] => {
    return prices.map((_, index) => {
      if (index < days - 1) return 0;
      const slice = prices.slice(index - days + 1, index + 1);
      return slice.reduce((sum, price) => sum + price, 0) / days;
    });
  };

  const calculateVolatility = (prices: number[], days: number): number[] => {
    return prices.map((_, index) => {
      if (index < days - 1) return 0;
      const slice = prices.slice(index - days + 1, index + 1);
      const avg = slice.reduce((sum, price) => sum + price, 0) / days;
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / days;
      return Math.sqrt(variance);
    });
  };

  const calculateRSI = (prices: number[], period = 14): number[] => {
    const rsi: number[] = Array(prices.length).fill(0);
    
    for (let i = period; i < prices.length; i++) {
      let gains = 0;
      let losses = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        const change = prices[j] - prices[j - 1];
        if (change > 0) {
          gains += change;
        } else {
          losses -= change;
        }
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
    
    return rsi;
  };

  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(metric => 
      metric.id === id ? { ...metric, enabled: !metric.enabled } : metric
    ));
  };

  const renderCandlestickChart = () => {
    if (!selectedStock) return null;
    
    const data = selectedStock.dailyData.slice(-20); 
    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const range = maxPrice - minPrice;
    const width = 700;
    const height = 200;
    const candleWidth = width / data.length * 0.7;
    
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      
        <rect x="0" y="0" width={width} height={height} fill="#1F2937" />
        
       
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line 
            key={`grid-${i}`}
            x1="0" 
            y1={height - (height * t)} 
            x2={width} 
            y2={height - (height * t)} 
            stroke="#374151" 
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}
        
        {data.map((day, i) => {
          const x = (i / data.length) * width + (width / data.length * 0.15);
          const openY = height - ((day.open - minPrice) / range) * height;
          const closeY = height - ((day.close - minPrice) / range) * height;
          const highY = height - ((day.high - minPrice) / range) * height;
          const lowY = height - ((day.low - minPrice) / range) * height;
          const isBullish = day.close > day.open;
          const color = isBullish ? '#10B981' : '#EF4444';
          
          const pattern = detectedPatterns.find(p => p.index === i + (selectedStock.dailyData.length - data.length));
          
          return (
            <g key={`candle-${i}`}>
             
              <line 
                x1={x + candleWidth/2} 
                y1={highY} 
                x2={x + candleWidth/2} 
                y2={lowY} 
                stroke={color} 
                strokeWidth="1" 
              />
              
            
              <rect 
                x={x} 
                y={Math.min(openY, closeY)} 
                width={candleWidth} 
                height={Math.abs(openY - closeY)} 
                fill={color} 
                stroke={color} 
                strokeWidth="0.5"
              />
              
            
              {pattern && (
                <g>
                  <circle 
                    cx={x + candleWidth/2} 
                    cy={highY - 10} 
                    r="5" 
                    fill={pattern.bullish ? '#10B981' : pattern.bullish === false ? '#EF4444' : '#6B7280'}
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  <text 
                    x={x + candleWidth/2} 
                    y={highY - 15} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#FFF" 
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {pattern.name.split(' ')[0].charAt(0)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
       
        <g transform={`translate(${width - 150}, 20)`}>
          <rect x="0" y="0" width="140" height={detectedPatterns.length * 20 + 10} fill="#1F2937" stroke="#4B5563" rx="5" />
          <text x="10" y="15" fill="#FFF" fontSize="10" fontWeight="bold">Patterns Detected:</text>
          {detectedPatterns.map((pattern, i) => (
            <g key={`legend-${i}`} transform={`translate(10, ${25 + i * 20})`}>
              <circle cx="5" cy="5" r="4" fill={pattern.bullish ? '#10B981' : pattern.bullish === false ? '#EF4444' : '#6B7280'} />
              <text x="15" y="5" fill="#FFF" fontSize="10" dominantBaseline="middle">{pattern.name}</text>
            </g>
          ))}
          {detectedPatterns.length === 0 && (
            <text x="70" y="30" fill="#9CA3AF" fontSize="10" textAnchor="middle">No patterns detected</text>
          )}
        </g>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Portfolio Simulator</h1>
      
      <div className="flex mb-8 border-b border-gray-700">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'portfolio' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Analytics Dashboard
        </button>
      </div>

      {activeTab === 'portfolio' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div className="bg-gray-800 p-6 rounded-lg" whileHover={{ scale: 1.02 }}>
              <h3 className="text-gray-400 mb-2">Portfolio Value</h3>
              <p className="text-2xl font-bold">₹{portfolioValue.toLocaleString('en-IN')}</p>
            </motion.div>
            
            <motion.div className="bg-gray-800 p-6 rounded-lg" whileHover={{ scale: 1.02 }}>
              <h3 className="text-gray-400 mb-2">Cash Balance</h3>
              <p className="text-2xl font-bold">₹{cashBalance.toLocaleString('en-IN')}</p>
            </motion.div>
            
            <motion.div className="bg-gray-800 p-6 rounded-lg" whileHover={{ scale: 1.02 }}>
              <h3 className="text-gray-400 mb-2">Total Gain/Loss</h3>
              <p className="text-2xl font-bold">
                ₹{stocks.reduce((total, stock) => total + calculateProfitLoss(stock), 0).toLocaleString('en-IN')}
              </p>
            </motion.div>
          </div>

          {portfolioAllocation.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <PieChart className="mr-2" /> Asset Allocation
              </h2>
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-64 h-64 mb-4 md:mb-0 md:mr-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {portfolioAllocation.reduce((acc, item, i) => {
                      const startAngle = acc.currentAngle;
                      const angle = (item.value / portfolioValue) * 360;
                      acc.currentAngle += angle;
                      
                      const x1 = 50 + Math.cos((startAngle - 90) * Math.PI / 180) * 40;
                      const y1 = 50 + Math.sin((startAngle - 90) * Math.PI / 180) * 40;
                      const x2 = 50 + Math.cos((startAngle + angle - 90) * Math.PI / 180) * 40;
                      const y2 = 50 + Math.sin((startAngle + angle - 90) * Math.PI / 180) * 40;
                      
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      return {
                        currentAngle: acc.currentAngle,
                        elements: [
                          ...acc.elements,
                          <path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            stroke="#1F2937"
                            strokeWidth="0.5"
                          />
                        ]
                      };
                    }, { currentAngle: 0, elements: [] as JSX.Element[] }).elements}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {portfolioAllocation.map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}: {(item.value / portfolioValue * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Available Stocks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stocks.map(stock => (
                <motion.div
                  key={stock.id}
                  className={`p-4 rounded-lg border ${
                    selectedStock?.id === stock.id 
                      ? 'border-blue-500 bg-gray-700' 
                      : 'border-gray-700 hover:bg-gray-700'
                  } cursor-pointer`}
                  onClick={() => setSelectedStock(stock)}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{stock.name}</h3>
                      <p className="text-sm text-gray-400">₹{stock.currentPrice.toFixed(2)}</p>
                    </div>
                    <div className={`flex items-center ${
                      stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stock.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      <span>{stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)</span>
                    </div>
                  </div>
                  {stock.quantity > 0 && (
                    <div className="mt-2 text-sm">
                      <p>Held: {stock.quantity}</p>
                      <p>Avg: ₹{stock.avgBuyPrice.toFixed(2)}</p>
                      <p className={calculateProfitLoss(stock) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        P/L: ₹{calculateProfitLoss(stock).toFixed(2)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {selectedStock && (
            <motion.div 
              className="bg-gray-800 p-6 rounded-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Trade {selectedStock.name} (₹{selectedStock.currentPrice.toFixed(2)})
                </h2>
                <button onClick={() => setSelectedStock(null)}>
                  <X />
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-700 p-2 rounded-l"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-gray-700 text-center w-16 py-2"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-700 p-2 rounded-r"
                >
                  <Plus size={16} />
                </button>
                <span className="ml-4">
                  Total: ₹{(selectedStock.currentPrice * quantity).toFixed(2)}
                </span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => executeTrade('buy')}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg flex-1"
                >
                  Buy
                </button>
                <button
                  onClick={() => executeTrade('sell')}
                  disabled={selectedStock.quantity < quantity}
                  className={`px-6 py-2 rounded-lg flex-1 ${
                    selectedStock.quantity < quantity
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Sell
                </button>
              </div>
            </motion.div>
          )}

          {transactions.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Stock</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...transactions].reverse().map(tx => {
                      const stock = stocks.find(s => s.id === tx.stockId);
                      return (
                        <tr key={tx.id} className="border-b border-gray-700">
                          <td className="py-2">{new Date(tx.date).toLocaleString()}</td>
                          <td>{stock?.name || 'Unknown'}</td>
                          <td className={tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                            {tx.type.toUpperCase()}
                          </td>
                          <td>₹{tx.price.toFixed(2)}</td>
                          <td>{tx.quantity}</td>
                          <td>₹{(tx.price * tx.quantity).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <LineChart className="mr-2" /> Analytics Dashboard
              </h2>
              <button 
                onClick={() => setShowMetricsSettings(!showMetricsSettings)}
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                <Settings size={16} className="mr-1" /> Metrics
              </button>
            </div>

            <AnimatePresence>
              {showMetricsSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-700 p-4 rounded-lg mb-6 overflow-hidden"
                >
                  <h3 className="font-medium mb-3">Select Metrics to Display</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {metrics.map(metric => (
                      <div key={metric.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`metric-${metric.id}`}
                          checked={metric.enabled}
                          onChange={() => toggleMetric(metric.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`metric-${metric.id}`}>{metric.name}</label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6">
              <label htmlFor="stock-select" className="block mb-2">Select Stock:</label>
              <select
                id="stock-select"
                value={selectedStock?.id || ''}
                onChange={(e) => {
                  const stock = stocks.find(s => s.id === e.target.value);
                  setSelectedStock(stock || null);
                }}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full md:w-1/3"
              >
                <option value="">-- Select a stock --</option>
                {stocks.map(stock => (
                  <option key={stock.id} value={stock.id}>{stock.name}</option>
                ))}
              </select>
            </div>

            {selectedStock && (
              <div className="space-y-8">
                {metrics.find(m => m.id === 'patterns')?.enabled && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-4 flex items-center">
                      <CandlestickChart className="mr-2" /> Candlestick Chart with Pattern Recognition
                    </h3>
                    <div className="h-64">
                      {renderCandlestickChart()}
                    </div>
                    {detectedPatterns.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Detected Patterns:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {detectedPatterns.map((pattern, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded text-sm ${
                                pattern.bullish ? 'bg-green-900/50 text-green-400' : 
                                pattern.bullish === false ? 'bg-red-900/50 text-red-400' : 
                                'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {pattern.name} (Day {pattern.index + 1})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4 flex items-center">
                    <LineChart className="mr-2" /> Price Chart (30 days)
                  </h3>
                  <div className="h-64">
                    <svg width="100%" height="100%" viewBox="0 0 800 300">
                      <line x1="50" y1="250" x2="750" y2="250" stroke="#4B5563" strokeWidth="1" />
                      <line x1="50" y1="50" x2="50" y2="250" stroke="#4B5563" strokeWidth="1" />
                      
                      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                        const price = Math.min(...selectedStock.priceHistory) + 
                                      (Math.max(...selectedStock.priceHistory) - Math.min(...selectedStock.priceHistory)) * t;
                        return (
                          <g key={`y-label-${i}`}>
                            <text x="40" y={250 - t * 200} textAnchor="end" dominantBaseline="middle" fill="#9CA3AF" fontSize="12">
                              {price.toFixed(2)}
                            </text>
                            <line x1="45" y1={250 - t * 200} x2="50" y2={250 - t * 200} stroke="#4B5563" strokeWidth="1" strokeDasharray="2,2" />
                          </g>
                        );
                      })}
                      
                      <polyline
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        points={selectedStock.priceHistory.map((price, i) => {
                          const x = 50 + (i / (selectedStock.priceHistory.length - 1)) * 700;
                          const y = 250 - ((price - Math.min(...selectedStock.priceHistory)) / 
                                      (Math.max(...selectedStock.priceHistory) - Math.min(...selectedStock.priceHistory)) * 200);
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {metrics.find(m => m.id === 'ma5')?.enabled && (
                        <polyline
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                          points={calculateMovingAverage(selectedStock.priceHistory, 5).map((ma, i) => {
                            if (ma === 0) return '';
                            const x = 50 + (i / (selectedStock.priceHistory.length - 1)) * 700;
                            const y = 250 - ((ma - Math.min(...selectedStock.priceHistory)) / 
                                        (Math.max(...selectedStock.priceHistory) - Math.min(...selectedStock.priceHistory)) * 200);
                            return `${x},${y}`;
                          }).filter(Boolean).join(' ')}
                        />
                      )}
                      
                      {metrics.find(m => m.id === 'ma10')?.enabled && (
                        <polyline
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                          points={calculateMovingAverage(selectedStock.priceHistory, 10).map((ma, i) => {
                            if (ma === 0) return '';
                            const x = 50 + (i / (selectedStock.priceHistory.length - 1)) * 700;
                            const y = 250 - ((ma - Math.min(...selectedStock.priceHistory)) / 
                                        (Math.max(...selectedStock.priceHistory) - Math.min(...selectedStock.priceHistory)) * 200);
                            return `${x},${y}`;
                          }).filter(Boolean).join(' ')}
                        />
                      )}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {metrics.find(m => m.id === 'volatility')?.enabled && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-4 flex items-center">
                        <BarChart className="mr-2" /> Volatility (10-day)
                      </h3>
                      <div className="h-48">
                        <svg width="100%" height="100%" viewBox="0 0 800 200">
                          <line x1="50" y1="150" x2="750" y2="150" stroke="#4B5563" strokeWidth="1" />
                          <line x1="50" y1="50" x2="50" y2="150" stroke="#4B5563" strokeWidth="1" />
                          
                          {calculateVolatility(selectedStock.priceHistory, 10).map((vol, i) => {
                            if (vol === 0) return null;
                            const x = 50 + (i / (selectedStock.priceHistory.length - 1)) * 700;
                            const height = Math.min(vol * 10, 100);
                            return (
                              <rect
                                key={`vol-${i}`}
                                x={x - 5}
                                y={150 - height}
                                width="10"
                                height={height}
                                fill="#8B5CF6"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {metrics.find(m => m.id === 'rsi')?.enabled && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-4 flex items-center">
                        <CandlestickChart className="mr-2" /> RSI (14-day)
                      </h3>
                      <div className="h-48">
                        <svg width="100%" height="100%" viewBox="0 0 800 200">
                          <line x1="50" y1="150" x2="750" y2="150" stroke="#4B5563" strokeWidth="1" />
                          <line x1="50" y1="50" x2="50" y2="150" stroke="#4B5563" strokeWidth="1" />
                          
                          <line x1="50" y1="70" x2="750" y2="70" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,2" />
                          <line x1="50" y1="130" x2="750" y2="130" stroke="#10B981" strokeWidth="1" strokeDasharray="4,2" />
                          
                          <text x="755" y="75" fill="#EF4444" fontSize="12">70 (Overbought)</text>
                          <text x="755" y="135" fill="#10B981" fontSize="12">30 (Oversold)</text>
                          
                          <polyline
                            fill="none"
                            stroke="#EC4899"
                            strokeWidth="2"
                            points={calculateRSI(selectedStock.priceHistory).map((rsi, i) => {
                              if (rsi === 0) return '';
                              const x = 50 + (i / (selectedStock.priceHistory.length - 1)) * 700;
                              const y = 150 - rsi;
                              return `${x},${y}`;
                            }).filter(Boolean).join(' ')}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">Current Price</p>
                      <p className="text-xl">₹{selectedStock.currentPrice.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">5-Day MA</p>
                      <p className="text-xl">₹{calculateMovingAverage(selectedStock.priceHistory, 5).slice(-1)[0].toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">10-Day MA</p>
                      <p className="text-xl">₹{calculateMovingAverage(selectedStock.priceHistory, 10).slice(-1)[0].toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">10-Day Volatility</p>
                      <p className="text-xl">{calculateVolatility(selectedStock.priceHistory, 10).slice(-1)[0].toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">RSI (14)</p>
                      <p className={`text-xl ${
                        calculateRSI(selectedStock.priceHistory).slice(-1)[0] > 70 ? 'text-red-500' :
                        calculateRSI(selectedStock.priceHistory).slice(-1)[0] < 30 ? 'text-green-500' : ''
                      }`}>
                        {calculateRSI(selectedStock.priceHistory).slice(-1)[0].toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">52-Week High</p>
                      <p className="text-xl">₹{Math.max(...selectedStock.priceHistory).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">52-Week Low</p>
                      <p className="text-xl">₹{Math.min(...selectedStock.priceHistory).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm">Daily Change</p>
                      <p className={`text-xl ${selectedStock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.percentChange.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function getStockColor(id: string): string {
  const colors = [
    '#3B82F6', 
    '#10B981', 
    '#F59E0B', 
    '#EF4444', 
    '#8B5CF6', 
    '#EC4899', 
  ];
  return colors[parseInt(id) % colors.length];
}
