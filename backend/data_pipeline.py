"""
Data Pipeline for fetching and preprocessing NSE stock data
"""
import pandas as pd
import numpy as np
import yfinance as yf
from typing import Tuple, Optional
from datetime import datetime, timedelta


class DataPipeline:
    """Handles data fetching, preprocessing, and feature engineering for NSE stocks"""
    
    def __init__(self, lookback_days: int = 365):
        """
        Initialize the data pipeline
        
        Args:
            lookback_days: Number of days of historical data to fetch (default 1 year)
        """
        self.lookback_days = lookback_days
        self.raw_data = None
        self.processed_data = None
        self.X = None
        self.y = None
        self.dates = None
    
    def fetch_data(self, symbol: str) -> Optional[pd.DataFrame]:
        """
        Fetch historical NSE stock data
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE.NS')
            
        Returns:
            DataFrame with OHLCV data or None if fetch fails
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=self.lookback_days)
            
            data = yf.download(
                symbol,
                start=start_date,
                end=end_date,
                progress=False
            )
            
            if data.empty:
                return None
            
            self.raw_data = data.copy()
            return data
        except Exception as e:
            print(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    def preprocess_data(self) -> Optional[pd.DataFrame]:
        """
        Preprocess raw data: handle missing values, sort by date
        
        Returns:
            Processed DataFrame or None if preprocessing fails
        """
        if self.raw_data is None:
            return None
        
        try:
            data = self.raw_data.copy()
            
            # Reset index to make date a column
            if isinstance(data.index, pd.DatetimeIndex):
                data = data.reset_index()
            
            # Sort by date (ascending order)
            data = data.sort_values('Date').reset_index(drop=True)
            
            # Fill missing values using forward fill then backward fill
            data['Close'] = data['Close'].fillna(method='ffill').fillna(method='bfill')
            data['Volume'] = data['Volume'].fillna(method='ffill').fillna(method='bfill')
            
            # Drop any remaining NaN values
            data = data.dropna(subset=['Close'])
            
            self.processed_data = data
            return data
        except Exception as e:
            print(f"Error preprocessing data: {str(e)}")
            return None
    
    def create_features(self) -> Optional[Tuple[np.ndarray, np.ndarray, np.ndarray]]:
        """
        Create lag features for model training
        
        Returns:
            Tuple of (X, y, dates) or None if feature creation fails
        """
        if self.processed_data is None:
            return None
        
        try:
            data = self.processed_data.copy()
            
            # Create lag-1 feature (previous day's close price)
            data['lag_1'] = data['Close'].shift(1)
            
            # Remove rows with NaN (first row will have NaN lag)
            data = data.dropna()
            
            # Prepare features and target
            X = data[['lag_1']].values
            y = data['Close'].values
            dates = data['Date'].values
            
            self.X = X
            self.y = y
            self.dates = dates
            
            return X, y, dates
        except Exception as e:
            print(f"Error creating features: {str(e)}")
            return None
    
    def get_train_test_split(self, test_size: float = 0.2) -> Optional[Tuple]:
        """
        Split data into train and test sets
        
        Args:
            test_size: Fraction of data to use for testing (default 0.2)
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test) or None
        """
        if self.X is None or self.y is None:
            return None
        
        try:
            split_idx = int(len(self.X) * (1 - test_size))
            
            X_train = self.X[:split_idx]
            X_test = self.X[split_idx:]
            y_train = self.y[:split_idx]
            y_test = self.y[split_idx:]
            
            return X_train, X_test, y_train, y_test
        except Exception as e:
            print(f"Error splitting data: {str(e)}")
            return None
    
    def get_last_price_for_prediction(self) -> Optional[float]:
        """Get the last close price for making future predictions"""
        if self.processed_data is None or len(self.processed_data) == 0:
            return None
        return float(self.processed_data['Close'].iloc[-1])
    
    def process_symbol(self, symbol: str) -> Optional[Tuple]:
        """
        Complete pipeline: fetch, preprocess, and create features
        
        Args:
            symbol: Stock symbol (e.g., 'RELIANCE.NS')
            
        Returns:
            Tuple of (X, y, dates) or None
        """
        if not self.fetch_data(symbol):
            return None
        
        if not self.preprocess_data():
            return None
        
        return self.create_features()
