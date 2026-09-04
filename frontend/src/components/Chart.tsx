import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { StockData } from '../types';

interface ChartProps {
  historicalData: StockData[];
  predictions: number[];
  isLoading: boolean;
}

const Chart: React.FC<ChartProps> = ({ historicalData, predictions, isLoading }) => {
  // Combine historical and predicted data
  const combinedData = historicalData.map((item) => ({
    date: item.date,
    close: item.close,
    type: 'historical',
  }));

  // Add predicted data
  if (predictions.length > 0) {
    const lastDate = new Date(historicalData[historicalData.length - 1]?.date || new Date());
    predictions.forEach((prediction, index) => {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + index + 1);
      combinedData.push({
        date: nextDate.toISOString().split('T')[0],
        close: prediction,
        type: 'predicted',
      });
    });
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-center h-96">
        <div className="text-center text-gray-500">
          <p>Select a stock and fetch data to display the chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Stock Price Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={combinedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval={Math.floor(combinedData.length / 10) || 0}
          />
          <YAxis />
          <Tooltip
            formatter={(value: any) => value.toFixed(2)}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="close"
            name="Price"
            stroke="#3b82f6"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {predictions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          📊 Blue line shows historical data and predictions for next 10 days
        </div>
      )}
    </div>
  );
};

export default Chart;
