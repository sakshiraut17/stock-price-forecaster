"""
NSE Stock Price Forecaster - FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from data_pipeline import DataPipeline
from model import StockPriceModel

# Initialize FastAPI app
app = FastAPI(
    title="NSE Stock Forecaster API",
    description="Linear regression model for NSE stock price prediction",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response


# Global state for models
models_cache = {}
data_cache = {}


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "name": "NSE Stock Price Forecaster",
        "version": "1.0.0",
        "status": "active"
    }


@app.post("/fetch-data")
def fetch_data(request: StockSymbolRequest) -> HistoricalDataResponse:
    """
    Fetch 1 year of historical NSE stock data
    
    Args:
        request: Contains stock symbol (e.g., 'RELIANCE.NS')
        
    Returns:
        Historical OHLCV data with latest 100 records
    """
    try:
        symbol = request.symbol.strip().upper()
        
        # Validate symbol format
        if not symbol.endswith('.NS'):
            symbol = f"{symbol}.NS"
        
        pipeline = DataPipeline(lookback_days=365)
        
        # Fetch and process data
        raw_data = pipeline.fetch_data(symbol)
        if raw_data is None or raw_data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Could not fetch data for symbol {symbol}"
            )
        
        # Preprocess data
        processed_data = pipeline.preprocess_data()
        if processed_data is None:
            raise HTTPException(
                status_code=500,
                detail="Error preprocessing data"
            )
        
        # Cache the pipeline for later use
        data_cache[symbol] = pipeline
        
        # Get last 100 records for frontend
        display_data = processed_data.tail(100).copy()
        
        # Convert to list of dicts
        data_list = []
        for _, row in display_data.iterrows():
            data_list.append({
                'date': str(row['Date'].date()) if hasattr(row['Date'], 'date') else str(row['Date']),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume']) if 'Volume' in row else 0
            })
        
        return HistoricalDataResponse(
            symbol=symbol,
            data=data_list,
            message=f"Successfully fetched {len(display_data)} days of data for {symbol}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data: {str(e)}"
        )


@app.post("/train")
def train_model(request: TrainingRequest) -> TrainingResponse:
    """
    Train linear regression model on historical data
    
    Args:
        request: Contains stock symbol
        
    Returns:
        Model metrics (R², RMSE, MAE)
    """
    try:
        symbol = request.symbol.strip().upper()
        
        # Validate symbol format
        if not symbol.endswith('.NS'):
            symbol = f"{symbol}.NS"
        
        # Get cached pipeline or fetch new data
        if symbol not in data_cache:
            pipeline = DataPipeline(lookback_days=365)
            if not pipeline.fetch_data(symbol):
                raise HTTPException(
                    status_code=404,
                    detail=f"Could not fetch data for symbol {symbol}"
                )
            if not pipeline.preprocess_data():
                raise HTTPException(
                    status_code=500,
                    detail="Error preprocessing data"
                )
            data_cache[symbol] = pipeline
        else:
            pipeline = data_cache[symbol]
        
        # Create features
        features_result = pipeline.create_features()
        if not features_result:
            raise HTTPException(
                status_code=500,
                detail="Error creating features"
            )
        
        X, y, dates = features_result
        
        # Get train/test split
        split_result = pipeline.get_train_test_split(test_size=0.2)
        if not split_result:
            raise HTTPException(
                status_code=500,
                detail="Error splitting data"
            )
        
        X_train, X_test, y_train, y_test = split_result
        
        # Get last price
        last_price = pipeline.get_last_price_for_prediction()
        if last_price is None:
            raise HTTPException(
                status_code=500,
                detail="Could not get last price"
            )
        
        # Train model
        model = StockPriceModel()
        metrics = model.train(X_train, y_train, X_test, y_test, last_price)
        
        # Cache the trained model
        models_cache[symbol] = model
        
        return TrainingResponse(
            symbol=symbol,
            metrics=metrics,
            message=f"Model trained successfully for {symbol}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error training model: {str(e)}"
        )


@app.post("/predict")
def predict_prices(request: PredictionRequest) -> PredictionResponse:
    """
    Predict next n days of stock prices
    
    Args:
        request: Contains symbol and number of days to predict
        
    Returns:
        List of predicted prices for next n days
    """
    try:
        symbol = request.symbol.strip().upper()
        n_days = request.n_days
        
        # Validate symbol format
        if not symbol.endswith('.NS'):
            symbol = f"{symbol}.NS"
        
        # Validate n_days
        if n_days <= 0 or n_days > 365:
            raise HTTPException(
                status_code=400,
                detail="n_days must be between 1 and 365"
            )
        
        # Check if model is trained
        if symbol not in models_cache:
            raise HTTPException(
                status_code=400,
                detail=f"Model not trained for {symbol}. Please train first."
            )
        
        model = models_cache[symbol]
        predictions = model.predict_next_n_days(n_days)
        
        if predictions is None:
            raise HTTPException(
                status_code=500,
                detail=f"Could not generate predictions for {n_days} days"
            )
        
        return PredictionResponse(
            symbol=symbol,
            predictions=predictions,
            message=f"Successfully predicted prices for {n_days} days"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error making predictions: {str(e)}"
        )


@app.get("/metrics/{symbol}")
def get_metrics(symbol: str) -> MetricsResponse:
    """
    Get model performance metrics for a stock
    
    Args:
        symbol: Stock symbol (e.g., 'RELIANCE.NS')
        
    Returns:
        Model metrics (R², RMSE, MAE, trained status)
    """
    try:
        symbol = symbol.strip().upper()
        
        # Validate symbol format
        if not symbol.endswith('.NS'):
            symbol = f"{symbol}.NS"
        
        if symbol not in models_cache:
            return MetricsResponse(
                symbol=symbol,
                trained=False,
                metrics={}
            )
        
        model = models_cache[symbol]
        metrics = model.get_metrics()
        
        return MetricsResponse(
            symbol=symbol,
            trained=True,
            metrics=metrics
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching metrics: {str(e)}"
        )


@app.get("/available-symbols")
def get_available_symbols():
    """Get list of available NSE stock symbols"""
    return {
        "symbols": [
            "RELIANCE.NS",
            "TCS.NS",
            "INFY.NS",
            "WIPRO.NS",
            "HDFC.NS",
            "ICICIBANK.NS",
            "KOTAKBANK.NS",
            "AXISBANK.NS",
            "MARUTI.NS",
            "LT.NS"
        ],
        "note": "You can use any valid NSE symbol. Format: SYMBOL.NS"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
