export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Metrics {
  r2_score: number;
  rmse: number;
  mae: number;
  coefficient: number;
  intercept: number;
}

export interface ApiResponse<T> {
  symbol: string;
  data?: T;
  message: string;
  metrics?: Metrics;
  predictions?: number[];
  trained?: boolean;
}

export interface HistoricalDataResponse {
  symbol: string;
  data: StockData[];
  message: string;
}

export interface TrainingResponse {
  symbol: string;
  metrics: Metrics;
  message: string;
}

export interface PredictionResponse {
  symbol: string;
  predictions: number[];
  message: string;
}

export interface MetricsResponse {
  symbol: string;
  trained: boolean;
  metrics: Metrics;
}
