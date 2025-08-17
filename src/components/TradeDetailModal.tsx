'use client';

import { X, ExternalLink, Calendar, DollarSign, TrendingUp, TrendingDown, Building2, User } from 'lucide-react';

interface Trade {
  id: number;
  company: string;
  ticker: string;
  insider: string;
  title: string;
  tradeType: 'sale' | 'purchase';
  shares: number;
  value: number;
  pricePerShare: number;
  date: string;
  filingDate: string;
}

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeDetailModal({ trade, isOpen, onClose }: TradeDetailModalProps) {
  if (!isOpen || !trade) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trade Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SEC Form 4 Filing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Trade Type Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              trade.tradeType === 'sale' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {trade.tradeType === 'sale' ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-1" />
              )}
              {trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1)} Transaction
            </span>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Company Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company</h3>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{trade.company}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ticker: {trade.ticker}</p>
              </div>
            </div>

            {/* Insider Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insider</h3>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{trade.insider}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{trade.title}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(trade.shares)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(trade.value)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price per Share</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(trade.pricePerShare)}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Important Dates</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(trade.date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filing Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(trade.filingDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              View SEC Filing
            </button>
            <button className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <Building2 className="w-4 h-4 mr-2" />
              View Company Profile
            </button>
            <button className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <User className="w-4 h-4 mr-2" />
              View Insider Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}