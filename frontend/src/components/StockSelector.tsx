import React, { useState, useEffect } from 'react';
import stockForecastService from '../services/api';

interface StockSelectorProps {
  onSymbolChange: (symbol: string) => void;
  isLoading: boolean;
  selectedSymbol: string;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  onSymbolChange,
  isLoading,
  selectedSymbol,
}) => {
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await stockForecastService.getAvailableSymbols();
        setAvailableSymbols(response.symbols);
        setError('');
      } catch (err) {
        setError('Failed to load available symbols');
        console.error(err);
      }
    };

    fetchSymbols();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Stock Symbol
      </label>
      <div className="flex gap-2">
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Select a stock --</option>
          {availableSymbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
      <div className="mt-2 text-sm text-gray-600">
        Tip: Format is SYMBOL.NS (e.g., RELIANCE.NS)
      </div>
    </div>
  );
};

export default StockSelector;
