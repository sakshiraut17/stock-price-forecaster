"""
Linear Regression Model for stock price prediction
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from typing import Optional, Dict, Tuple


class StockPriceModel:
    """Linear Regression model for NSE stock price prediction"""
    
    def __init__(self):
        """Initialize the model"""
        self.model = LinearRegression()
        self.is_trained = False
        self.metrics = {}
        self.last_price = None
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test: np.ndarray,
        y_test: np.ndarray,
        last_price: float
    ) -> Dict[str, float]:
        """
        Train the model on historical data
        
        Args:
            X_train: Training features (lag-1 prices)
            y_train: Training targets (current prices)
            X_test: Testing features
            y_test: Testing targets
            last_price: The last known closing price
            
        Returns:
            Dictionary with training metrics (R², RMSE, MAE)
        """
        try:
            # Train the model
            self.model.fit(X_train, y_train)
            self.is_trained = True
            self.last_price = last_price
            
            # Make predictions on test set
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            r2 = r2_score(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            
            self.metrics = {
                'r2_score': float(r2),
                'rmse': float(rmse),
                'mae': float(mae),
                'coefficient': float(self.model.coef_[0]),
                'intercept': float(self.model.intercept_)
            }
            
            return self.metrics
        except Exception as e:
            print(f"Error training model: {str(e)}")
            return {}
    
    def predict(self, price: float) -> Optional[float]:
        """
        Predict next day price given current price
        
        Args:
            price: Current closing price
            
        Returns:
            Predicted next day price or None if model not trained
        """
        if not self.is_trained:
            return None
        
        try:
            price_array = np.array([[price]])
            prediction = self.model.predict(price_array)[0]
            return float(prediction)
        except Exception as e:
            print(f"Error making prediction: {str(e)}")
            return None
    
    def predict_next_n_days(self, n_days: int = 10) -> Optional[list]:
        """
        Predict prices for next n days using iterative approach
        
        Args:
            n_days: Number of days to predict (default 10)
            
        Returns:
            List of predicted prices or None
        """
        if not self.is_trained or self.last_price is None:
            return None
        
        try:
            predictions = []
            current_price = self.last_price
            
            for _ in range(n_days):
                next_price = self.predict(current_price)
                if next_price is None:
                    break
                predictions.append(float(next_price))
                current_price = next_price
            
            return predictions if len(predictions) == n_days else None
        except Exception as e:
            print(f"Error predicting next {n_days} days: {str(e)}")
            return None
    
    def get_metrics(self) -> Dict[str, float]:
        """
        Get model performance metrics
        
        Returns:
            Dictionary with R², RMSE, MAE and model coefficients
        """
        return self.metrics.copy()
    
    def get_model_info(self) -> Dict:
        """
        Get model information and coefficients
        
        Returns:
            Dictionary with model details
        """
        if not self.is_trained:
            return {'status': 'not_trained'}
        
        return {
            'status': 'trained',
            'coefficient': float(self.model.coef_[0]),
            'intercept': float(self.model.intercept_),
            'equation': f"Price(t) = {self.model.coef_[0]:.4f} * Price(t-1) + {self.model.intercept_:.4f}",
            'metrics': self.metrics
        }
