import React, { useState, useEffect } from 'react';
import StockSelector from './components/StockSelector';
import Chart from './components/Chart';
import Predictions from './components/Predictions';
import MetricsComponent from './components/Metrics';
import stockForecastService from './services/api';
import { StockData, Metrics } from './types';
import './App.css';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE.NS');
  const [historicalData, setHistoricalData] = useState<StockData[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isTrained, setIsTrained] = useState<boolean>(false);

  const [loading, setLoading] = useState({
    data: false,
    training: false,
    prediction: false,
    metrics: false,
  });

  const [errors, setErrors] = useState({
    data: '',
    training: '',
    prediction: '',
    metrics: '',
  });

  /**
   * Fetch historical data for selected stock
   */
  const handleFetchData = async () => {
    if (!selectedSymbol) {
      setErrors((prev) => ({ ...prev, data: 'Please select a stock' }));
      return;
    }

    setLoading((prev) => ({ ...prev, data: true }));
    setErrors((prev) => ({ ...prev, data: '' }));

    try {
      const response = await stockForecastService.fetchHistoricalData(selectedSymbol);
      setHistoricalData(response.data);
      setIsTrained(false);
      setPredictions([]);
      setMetrics(null);
      setErrors((prev) => ({ ...prev, data: '' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setErrors((prev) => ({ ...prev, data: errorMessage }));
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  /**
   * Train the model
   */
  const handleTrainModel = async () => {
    if (!selectedSymbol) {
      setErrors((prev) => ({ ...prev, training: 'Please select a stock' }));
      return;
    }

    if (historicalData.length === 0) {
      setErrors((prev) => ({ ...prev, training: 'Fetch data first' }));
      return;
    }

    setLoading((prev) => ({ ...prev, training: true }));
    setErrors((prev) => ({ ...prev, training: '' }));

    try {
      const response = await stockForecastService.trainModel(selectedSymbol);
      setMetrics(response.metrics);
      setIsTrained(true);
      setErrors((prev) => ({ ...prev, training: '' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to train model';
      setErrors((prev) => ({ ...prev, training: errorMessage }));
    } finally {
      setLoading((prev) => ({ ...prev, training: false }));
    }
  };

  /**
   * Generate predictions
   */
  const handlePredictPrices = async () => {
    if (!selectedSymbol) {
      setErrors((prev) => ({ ...prev, prediction: 'Please select a stock' }));
      return;
    }

    if (!isTrained) {
      setErrors((prev) => ({ ...prev, prediction: 'Train model first' }));
      return;
    }

    setLoading((prev) => ({ ...prev, prediction: true }));
    setErrors((prev) => ({ ...prev, prediction: '' }));

    try {
      const response = await stockForecastService.getPredictions(selectedSymbol, 10);
      setPredictions(response.predictions);
      setErrors((prev) => ({ ...prev, prediction: '' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate predictions';
      setErrors((prev) => ({ ...prev, prediction: errorMessage }));
    } finally {
      setLoading((prev) => ({ ...prev, prediction: false }));
    }
  };

  /**
   * Fetch and display metrics
   */
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedSymbol) return;
      
      try {
        const response = await stockForecastService.getMetrics(selectedSymbol);
        if (response.trained) {
          setMetrics(response.metrics);
          setIsTrained(true);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, [selectedSymbol]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setHistoricalData([]);
    setPredictions([]);
    setMetrics(null);
    setIsTrained(false);
    setErrors({ data: '', training: '', prediction: '', metrics: '' });
  };

  const lastHistoricalPrice =
    historicalData.length > 0 ? historicalData[historicalData.length - 1].close : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">📈 NSE Stock Price Forecaster</h1>
          <p className="text-blue-100">
            Predict NSE stock prices using Linear Regression models
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stock Selector */}
        <StockSelector
          selectedSymbol={selectedSymbol}
          onSymbolChange={handleSymbolChange}
          isLoading={loading.data || loading.training || loading.prediction}
        />

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFetchData}
              disabled={loading.data || !selectedSymbol}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading.data ? '⏳ Fetching...' : '📥 Fetch Data'}
            </button>

            <button
              onClick={handleTrainModel}
              disabled={loading.training || !selectedSymbol || historicalData.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading.training ? '⏳ Training...' : '🤖 Train Model'}
            </button>

            <button
              onClick={handlePredictPrices}
              disabled={loading.prediction || !isTrained}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading.prediction ? '⏳ Predicting...' : '🔮 Predict Prices'}
            </button>
          </div>

          {/* Error Messages */}
          {(errors.data || errors.training || errors.prediction) && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-semibold">Error:</p>
              {errors.data && <p className="text-red-600">{errors.data}</p>}
              {errors.training && <p className="text-red-600">{errors.training}</p>}
              {errors.prediction && <p className="text-red-600">{errors.prediction}</p>}
            </div>
          )}
        </div>

        {/* Chart */}
        <Chart
          historicalData={historicalData}
          predictions={predictions}
          isLoading={loading.data}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictions */}
          <Predictions
            predictions={predictions}
            isLoading={loading.prediction}
            error={errors.prediction}
            lastHistoricalPrice={lastHistoricalPrice}
          />

          {/* Metrics */}
          <MetricsComponent
            metrics={metrics}
            isTrained={isTrained}
            isLoading={loading.training}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md text-center text-gray-600">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This forecaster uses linear regression for educational purposes.
          </p>
          <p>Actual stock prices may differ significantly from predictions. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
