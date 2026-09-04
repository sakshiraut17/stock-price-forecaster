import axios, { AxiosInstance } from 'axios';
import {
  HistoricalDataResponse,
  TrainingResponse,
  PredictionResponse,
  MetricsResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class StockForecastService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch historical stock data for the last 1 year
   */
  async fetchHistoricalData(symbol: string): Promise<HistoricalDataResponse> {
    try {
      const response = await this.api.post('/fetch-data', { symbol });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Train the linear regression model on historical data
   */
  async trainModel(symbol: string): Promise<TrainingResponse> {
    try {
      const response = await this.api.post('/train', { symbol });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get predictions for the next n days
   */
  async getPredictions(
    symbol: string,
    nDays: number = 10
  ): Promise<PredictionResponse> {
    try {
      const response = await this.api.post('/predict', {
        symbol,
        n_days: nDays,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get model performance metrics
   */
  async getMetrics(symbol: string): Promise<MetricsResponse> {
    try {
      const response = await this.api.get(`/metrics/${symbol}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of available NSE symbols
   */
  async getAvailableSymbols(): Promise<{ symbols: string[] }> {
    try {
      const response = await this.api.get('/available-symbols');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.message || 
                     'An error occurred while communicating with the API';
      return new Error(message);
    }
    return new Error('An unexpected error occurred');
  }
}

export default new StockForecastService();
