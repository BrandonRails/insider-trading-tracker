'use client';

import { useState } from 'react';
import { BarChart3, PieChart, Activity } from 'lucide-react';

interface ChartData {
  company: string;
  trades: number;
  volume: number;
  color: string;
}

export default function TradingChart() {
  const [chartType, setChartType] = useState<'volume' | 'trades' | 'trend'>('volume');

  const mockChartData: ChartData[] = [
    { company: 'TSLA', trades: 15, volume: 3960000000, color: 'bg-blue-500' },
    { company: 'NVDA', trades: 8, volume: 1854000000, color: 'bg-green-500' },
    { company: 'AAPL', trades: 12, volume: 874200000, color: 'bg-yellow-500' },
    { company: 'MSFT', trades: 6, volume: 1098700000, color: 'bg-purple-500' },
    { company: 'GOOGL', trades: 4, volume: 32400000, color: 'bg-red-500' },
  ];

  const maxVolume = Math.max(...mockChartData.map(d => d.volume));
  const maxTrades = Math.max(...mockChartData.map(d => d.trades));

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const trendData = [
    { month: 'Jan', sales: 45, purchases: 12 },
    { month: 'Feb', sales: 38, purchases: 18 },
    { month: 'Mar', sales: 52, purchases: 8 },
    { month: 'Apr', sales: 61, purchases: 15 },
    { month: 'May', sales: 55, purchases: 22 },
    { month: 'Jun', sales: 48, purchases: 19 },
  ];

  const maxTrendValue = Math.max(...trendData.flatMap(d => [d.sales, d.purchases]));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            Trading Analytics
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('volume')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'volume'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Volume
            </button>
            <button
              onClick={() => setChartType('trades')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'trades'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <PieChart className="w-4 h-4 mr-1" />
              Count
            </button>
            <button
              onClick={() => setChartType('trend')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'trend'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 mr-1" />
              Trend
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {chartType === 'volume' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Trading Volume by Company
            </h3>
            {mockChartData.map((data) => (
              <div key={data.company} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-900 dark:text-white">
                  {data.company}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                  <div
                    className={`${data.color} h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                    style={{ width: `${(data.volume / maxVolume) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {formatCurrency(data.volume)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {chartType === 'trades' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Number of Trades by Company
            </h3>
            {mockChartData.map((data) => (
              <div key={data.company} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-900 dark:text-white">
                  {data.company}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                  <div
                    className={`${data.color} h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                    style={{ width: `${(data.trades / maxTrades) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {data.trades} trades
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {chartType === 'trend' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Monthly Trading Trends
            </h3>
            <div className="grid grid-cols-6 gap-4">
              {trendData.map((data) => (
                <div key={data.month} className="text-center">
                  <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {data.month}
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-20 bg-gray-100 dark:bg-gray-700 rounded">
                      <div
                        className="absolute bottom-0 w-full bg-red-500 rounded-b transition-all duration-500"
                        style={{ height: `${(data.sales / maxTrendValue) * 100}%` }}
                      />
                      <div
                        className="absolute bottom-0 w-full bg-green-500 rounded-b transition-all duration-500 opacity-70"
                        style={{ height: `${(data.purchases / maxTrendValue) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center justify-center space-x-1 text-red-600 dark:text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded" />
                        <span>{data.sales}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded" />
                        <span>{data.purchases}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Purchases</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}