# NSE Stock Price Forecaster

A full-stack web application for predicting NSE (National Stock Exchange) stock prices using linear regression. Built with FastAPI (backend) and React with TypeScript (frontend).

## 🎯 Features

- **Historical Data Fetching**: Retrieve 1 year of NSE stock data using yfinance
- **Linear Regression Model**: Train a model on historical data with lag-1 features
- **10-Day Predictions**: Forecast stock prices for the next 10 trading days
- **Performance Metrics**: Display R² score, RMSE, and MAE for model evaluation
- **Interactive Charts**: Visualize historical and predicted prices with Recharts
- **CORS Enabled**: Frontend and backend communicate seamlessly
- **Error Handling**: Robust error handling and loading states
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS

## 📋 Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **pip** (Python package manager)
- **npm** or **yarn** (Node.js package manager)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock-price-forecaster
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

Check the interactive API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
stock-price-forecaster/
├── backend/
│   ├── main.py                    # FastAPI application with endpoints
│   ├── data_pipeline.py           # Data fetching and preprocessing
│   ├── model.py                   # Linear regression model
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Backend documentation
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── StockSelector.tsx  # Stock selection dropdown
│   │   │   ├── Chart.tsx          # Price chart component
│   │   │   ├── Predictions.tsx    # Predictions display
│   │   │   └── Metrics.tsx        # Model metrics display
│   │   ├── services/
│   │   │   └── api.ts            # API service layer
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── App.tsx               # Main app component
│   │   ├── App.css               # App styles
│   │   ├── index.tsx             # React entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                 # Frontend documentation
│
├── .gitignore
└── README.md                      # This file
```

## 🔌 API Endpoints

### 1. Fetch Historical Data

**Endpoint:** `POST /fetch-data`

**Request:**
```json
{
  "symbol": "RELIANCE.NS"
}
```

**Response:**
```json
{
  "symbol": "RELIANCE.NS",
  "data": [
    {
      "date": "2023-09-01",
      "open": 2750.50,
      "high": 2760.00,
      "low": 2740.00,
      "close": 2755.25,
      "volume": 5000000
    },
    ...
  ],
  "message": "Successfully fetched 252 days of data for RELIANCE.NS"
}
```

### 2. Train Model

**Endpoint:** `POST /train`

**Request:**
```json
{
  "symbol": "RELIANCE.NS"
}
```

**Response:**
```json
{
  "symbol": "RELIANCE.NS",
  "metrics": {
    "r2_score": 0.8234,
    "rmse": 45.67,
    "mae": 35.21,
    "coefficient": 0.9852,
    "intercept": 23.45
  },
  "message": "Model trained successfully for RELIANCE.NS"
}
```

### 3. Get Predictions

**Endpoint:** `POST /predict`

**Request:**
```json
{
  "symbol": "RELIANCE.NS",
  "n_days": 10
}
```

**Response:**
```json
{
  "symbol": "RELIANCE.NS",
  "predictions": [2760.50, 2765.25, 2770.00, 2768.50, 2775.00, 2780.25, 2785.00, 2783.50, 2790.00, 2795.25],
  "message": "Successfully predicted prices for 10 days"
}
```

### 4. Get Metrics

**Endpoint:** `GET /metrics/{symbol}`

**Response:**
```json
{
  "symbol": "RELIANCE.NS",
  "trained": true,
  "metrics": {
    "r2_score": 0.8234,
    "rmse": 45.67,
    "mae": 35.21,
    "coefficient": 0.9852,
    "intercept": 23.45
  }
}
```

### 5. Available Symbols

**Endpoint:** `GET /available-symbols`

**Response:**
```json
{
  "symbols": ["RELIANCE.NS", "TCS.NS", "INFY.NS", "WIPRO.NS", "HDFC.NS", ...],
  "note": "You can use any valid NSE symbol. Format: SYMBOL.NS"
}
```

## 📊 Available NSE Stock Symbols

The application includes pre-configured symbols:

- **RELIANCE.NS** - Reliance Industries
- **TCS.NS** - Tata Consultancy Services
- **INFY.NS** - Infosys
- **WIPRO.NS** - Wipro
- **HDFC.NS** - HDFC Bank
- **ICICIBANK.NS** - ICICI Bank
- **KOTAKBANK.NS** - Kotak Mahindra Bank
- **AXISBANK.NS** - Axis Bank
- **MARUTI.NS** - Maruti Suzuki
- **LT.NS** - Larsen & Toubro

You can also use any valid NSE symbol in the format `SYMBOL.NS`

## 🤖 Model Details

### Data Pipeline

1. **Fetch**: Retrieve 365 days (1 year) of historical OHLCV data from yfinance
2. **Preprocess**: 
   - Handle missing values (forward fill, then backward fill)
   - Sort data by date in ascending order
3. **Feature Engineering**:
   - Create lag-1 feature (previous day's close price)
   - Use lag-1 as input feature (X)
   - Use current close price as target (y)
4. **Train/Test Split**: 80% training, 20% testing

### Model Architecture

**Linear Regression Model:**
```
Price(t) = coefficient × Price(t-1) + intercept
```

- **Coefficient**: Typically close to 1.0, indicating high correlation between consecutive days
- **Intercept**: Small value, usually close to 0

### Performance Metrics

- **R² Score**: Coefficient of determination (0-1). Higher is better.
  - 0.8+: Excellent
  - 0.6-0.8: Good
  - 0.4-0.6: Fair
  - <0.4: Poor

- **RMSE**: Root Mean Square Error (in rupees). Lower is better.
  - Average prediction error magnitude

- **MAE**: Mean Absolute Error (in rupees). Lower is better.
  - Average absolute prediction error

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```
# Backend configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Frontend Configuration

The frontend uses environment variables for API configuration:

```
REACT_APP_API_URL=http://localhost:8000
```

Create a `.env.local` file in the `frontend/` directory to override defaults.

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📈 Workflow

1. **Select Stock**: Choose a stock symbol from the dropdown
2. **Fetch Data**: Click "Fetch Data" to retrieve 1 year of historical prices
3. **Train Model**: Click "Train Model" to train the linear regression model
4. **View Metrics**: Check R², RMSE, MAE to evaluate model performance
5. **Get Predictions**: Click "Predict Prices" to forecast next 10 days
6. **Analyze Results**: View the chart showing historical data + predictions

## ⚠️ Important Notes

### Disclaimer

This forecaster uses a **simple linear regression model** for **educational purposes only**. 

- Stock prices are affected by numerous unpredictable factors
- Linear regression assumes a linear relationship between consecutive prices
- **Actual stock prices may differ significantly from predictions**
- **This is NOT financial advice. Do not use for real trading decisions.**

### Limitations

- Linear regression may not capture complex market dynamics
- Model assumes past price correlation continues (often violated)
- No consideration of market events, news, or fundamental analysis
- Predictions accuracy decreases beyond 3-5 days

### Improvements

To enhance prediction accuracy, consider:
- Using LSTM or GRU neural networks
- Adding technical indicators (MA, RSI, MACD)
- Including volume and volatility data
- Ensemble methods combining multiple models
- Incorporating external data (sentiment, news, fundamentals)

## 🔒 Security

- CORS is configured to accept all origins (`*`). For production, restrict to specific domains.
- No authentication is currently implemented. Add if exposing to production.
- Input validation should be enhanced for untrusted environments.

## 🐛 Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
# Ensure virtual environment is activated and dependencies are installed
pip install -r requirements.txt
```

**Error: Port 8000 already in use**
```bash
# Change port in main.py or kill existing process
python main.py  # Modify the uvicorn.run() call
```

### Frontend Issues

**Error: Cannot find module 'recharts'**
```bash
# Reinstall dependencies
cd frontend
npm install
```

**API calls returning 404**
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in `main.py`
- Verify `REACT_APP_API_URL` environment variable

## 📚 Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Recharts**: https://recharts.org/
- **yfinance**: https://yfinance.readthedocs.io/
- **scikit-learn**: https://scikit-learn.org/
- **Tailwind CSS**: https://tailwindcss.com/

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for learning and exploration of stock price prediction**
