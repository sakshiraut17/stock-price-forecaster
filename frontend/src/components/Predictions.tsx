import React from 'react';
import { PredictionResponse } from '../types';

interface PredictionsProps {
  predictions: number[];
  isLoading: boolean;
  error: string;
  lastHistoricalPrice: number | null;
}

const Predictions: React.FC<PredictionsProps> = ({
  predictions,
  isLoading,
  error,
  lastHistoricalPrice,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-48">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
          <p className="text-gray-600">Generating predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Prediction Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Next 10 Days Predictions</h2>
        <p className="text-gray-600">
          Train the model and generate predictions to see forecasted prices
        </p>
      </div>
    );
  }

  const priceChange = predictions[predictions.length - 1] - (lastHistoricalPrice || 0);
  const percentChange = lastHistoricalPrice 
    ? ((priceChange / lastHistoricalPrice) * 100).toFixed(2)
    : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Next 10 Days Predictions</h2>
      
      {lastHistoricalPrice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-gray-700">
            Last Known Price: <span className="font-semibold">₹{lastHistoricalPrice.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Predicted Price (Day 10): <span className="font-semibold text-green-600">₹{predictions[predictions.length - 1].toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Predicted Change: <span className={`font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} ({percentChange}%)
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {predictions.map((price, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded border border-blue-200">
            <p className="text-xs text-gray-600 font-medium">Day {index + 1}</p>
            <p className="text-lg font-bold text-blue-600">₹{price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        ⚠️ These are predictions from a linear regression model. Actual prices may vary significantly.
      </div>
    </div>
  );
};

export default Predictions;
