'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight,  Plus, Trash2, DollarSign, PieChart, LineChart, History } from "lucide-react";

type Asset = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  shares: number;
  history: { price: number; date: Date }[];
};

type BacktestResult = {
  strategy: string;
  profit: number;
  trades: number;
  winRate: number;
  history: { date: Date; portfolioValue: number }[];
};

const stockOptions: Asset[] = [
  { id: '1', name: "Apple", symbol: "AAPL", price: 182.63, change: 1.2, shares: 0, history: [] },
  { id: '2', name: "Microsoft", symbol: "MSFT", price: 413.64, change: -0.5, shares: 0, history: [] },
  { id: '3', name: "Google", symbol: "GOOGL", price: 171.95, change: 0.8, shares: 0, history: [] },
  { id: '4', name: "Amazon", symbol: "AMZN", price: 185.71, change: 2.1, shares: 0, history: [] },
  { id: '5', name: "Tesla", symbol: "TSLA", price: 177.48, change: -1.3, shares: 0, history: [] },
];

const STRATEGIES = [
  { id: 'moving_avg', name: "Moving Average Crossover" },
  { id: 'momentum', name: "Momentum Strategy" },
  { id: 'mean_reversion', name: "Mean Reversion" }
];

export default function PortfolioTracker() {
  const [selectedAsset, setSelectedAsset] = useState(stockOptions[0].symbol);
  const [shares, setShares] = useState(1);
  const [portfolio, setPortfolio] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES[0].id);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const historyLength = useRef(30); 
  
  useEffect(() => {
    const generateHistory = (currentPrice: number) => {
      const history = [];
      let price = currentPrice;
      const today = new Date();
      
      for (let i = historyLength.current; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
     
        price = price * (1 + (Math.random() * 0.02 - 0.01));
        history.push({ price: parseFloat(price.toFixed(2)), date });
      }
      
      return history;
    };

    setPortfolio(stockOptions.map(stock => ({
      ...stock,
      history: generateHistory(stock.price)
    })));
  }, []);

 
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prevPortfolio => 
        prevPortfolio.map(asset => {
          const newPrice = asset.price * (1 + (Math.random() * 0.02 - 0.01));
          const newHistory = [...asset.history.slice(1), { 
            price: parseFloat(newPrice.toFixed(2)), 
            date: new Date() 
          }];
          
          return {
            ...asset,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((Math.random() * 4 - 2).toFixed(2)),
            history: newHistory
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalValue(portfolio.reduce((sum, asset) => sum + (asset.price * asset.shares), 0));
  }, [portfolio]);

  const addAsset = () => {
    const asset = portfolio.find(item => item.symbol === selectedAsset);
    if (asset && !portfolio.find(item => item.symbol === selectedAsset && item.shares > 0)) {
      setPortfolio([...portfolio.filter(item => item.symbol !== selectedAsset), { 
        ...asset, 
        shares,
        change: parseFloat((Math.random() * 4 - 2).toFixed(2))
      }]);
      setShares(1);
    }
  };

  const removeAsset = (symbol: string) => {
    setPortfolio(portfolio.filter(item => item.symbol !== symbol));
  };

  const updateShares = (symbol: string, newShares: number) => {
    setPortfolio(portfolio.map(item => 
      item.symbol === symbol ? { ...item, shares: newShares } : item
    ));
  };

  const runBacktest = () => {
    setIsBacktesting(true);
    
    
    setTimeout(() => {
      const results: BacktestResult[] = [];
      const portfolioAssets = portfolio.filter(a => a.shares > 0);
      
      if (portfolioAssets.length === 0) {
        setIsBacktesting(false);
        return;
      }

     
      STRATEGIES.forEach(strategy => {
        let profit = 0;
        let trades = 0;
        let wins = 0;
        const history = [];
        
       
        for (let i = 0; i < 30; i++) {
          const dayProfit = portfolioAssets.reduce((sum, asset) => {
           
            let tradeResult = 0;
            trades++;
            
            if (strategy.id === 'moving_avg') {
             
              const shouldBuy = Math.random() > 0.5;
              tradeResult = shouldBuy ? asset.price * 0.02 : -asset.price * 0.01;
            } else if (strategy.id === 'momentum') {
             
              tradeResult = asset.change > 0 ? asset.price * 0.015 : -asset.price * 0.01;
            } else {
              
              tradeResult = asset.change < 0 ? asset.price * 0.01 : -asset.price * 0.005;
            }
            
            if (tradeResult > 0) wins++;
            return sum + tradeResult * asset.shares;
          }, 0);
          
          profit += dayProfit;
          history.push({
            date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
            portfolioValue: totalValue + profit
          });
        }
        
        results.push({
          strategy: strategy.name,
          profit: parseFloat(profit.toFixed(2)),
          trades,
          winRate: parseFloat(((wins / trades) * 100).toFixed(1)),
          history
        });
      });
      
      setBacktestResults(results);
      setIsBacktesting(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Portfolio Tracker</h1>

       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div className="bg-gray-800 p-6 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }}>
            <h3 className="text-gray-400 mb-2 flex items-center">
              <DollarSign className="mr-2 text-blue-400" size={16} /> Portfolio Value
            </h3>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </motion.div>
          
          <motion.div className="bg-gray-800 p-6 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }}>
            <h3 className="text-gray-400 mb-2">Assets</h3>
            <p className="text-2xl font-bold">{portfolio.filter(a => a.shares > 0).length}</p>
          </motion.div>
          
          <motion.div className="bg-gray-800 p-6 rounded-lg shadow-lg" whileHover={{ scale: 1.02 }}>
            <h3 className="text-gray-400 mb-2 flex items-center">
              <PieChart className="mr-2 text-blue-400" size={16} /> Allocation
            </h3>
            <p className="text-2xl font-bold">
              {portfolio.length > 0 ? (100 / portfolio.length).toFixed(0) : 0}%
            </p>
          </motion.div>
        </div>

        
        <motion.div 
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Add New Asset</h2>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {portfolio.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol} className="bg-gray-800">
                    {stock.name} ({stock.symbol}) - ${stock.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Shares</label>
              <input
                type="number"
                min="1"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            
            <motion.button
              onClick={addAsset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="mr-2" size={16} />
              Add Asset
            </motion.button>
          </div>
        </motion.div>

        
        <motion.div 
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-blue-400 flex items-center">
              <History className="mr-2" size={20} /> Strategy Backtesting
            </h2>
            <button 
              onClick={() => setShowResults(!showResults)}
              className="text-blue-400 hover:text-blue-300 mt-2 sm:mt-0"
            >
              {showResults ? 'Hide Results' : 'Show Results'}
            </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-400 mb-1">Strategy</label>
              <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
              {STRATEGIES.map(strategy => (
                <option key={strategy.id} value={strategy.id} className="bg-gray-800">
                {strategy.name}
                </option>
              ))}
              </select>
            </div>
            
            <motion.button
              onClick={runBacktest}
              disabled={isBacktesting || portfolio.filter(a => a.shares > 0).length === 0}
              className={`px-4 py-2 rounded flex items-center justify-center w-full md:w-auto ${
              isBacktesting || portfolio.filter(a => a.shares > 0).length === 0
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              whileHover={{ scale: isBacktesting ? 1 : 1.05 }}
              whileTap={{ scale: isBacktesting ? 1 : 0.95 }}
            >
              {isBacktesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Backtesting...
              </>
              ) : (
              <>
                <LineChart className="mr-2" size={16} />
                Run Backtest
              </>
              )}
            </motion.button>
            </div>

            <AnimatePresence>
            {showResults && backtestResults.length > 0 && (
              <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {backtestResults.map((result, index) => (
                <motion.div
                  key={index}
                  className={`bg-gray-750 p-4 rounded-lg border ${
                  result.strategy === STRATEGIES.find(s => s.id === selectedStrategy)?.name
                    ? 'border-blue-500' : 'border-gray-700'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="font-medium mb-2">{result.strategy}</h3>
                  <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Profit:</span>
                  <span className={result.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${result.profit.toFixed(2)}
                  </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Trades:</span>
                  <span>{result.trades}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate:</span>
                  <span>{result.winRate}%</span>
                  </div>
                  <div className="mt-3 h-20 w-full">
                  {/* Simple sparkline chart */}
                  <svg width="100%" height="100%" viewBox="0 0 100 30" className="text-blue-400">
                    <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    points={result.history.map((h, i) => 
                      `${(i * 100) / (result.history.length - 1)},${30 - ((h.portfolioValue - totalValue + result.profit) / (result.profit * 2 || 1)) * 30}`
                    ).join(' ')}
                    />
                  </svg>
                  </div>
                </motion.div>
                ))}
              </div>
                  </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

       
        {portfolio.filter(a => a.shares > 0).length === 0 ? (
          <motion.div 
            className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400">Your portfolio is empty</p>
            <p className="text-sm text-gray-500 mt-2">Add assets to begin tracking and backtesting</p>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {portfolio.filter(a => a.shares > 0).map((asset) => (
                    <motion.tr
                      key={asset.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-750"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-gray-400">{asset.symbol}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${asset.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={asset.shares}
                          onChange={(e) => updateShares(asset.symbol, Math.max(1, parseInt(e.target.value) || 1))}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(asset.price * asset.shares).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change >= 0 ? (
                            <ArrowUpRight className="mr-1" size={16} />
                          ) : (
                            <ArrowDownRight className="mr-1" size={16} />
                          )}
                          {asset.change}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          onClick={() => removeAsset(asset.symbol)}
                          className="text-red-400 hover:text-red-300 flex items-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="mr-1" size={16} />
                          Remove
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
