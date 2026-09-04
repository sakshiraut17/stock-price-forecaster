import React from 'react';
import { Metrics } from '../types';

interface MetricsProps {
  metrics: Metrics | null;
  isTrained: boolean;
  isLoading: boolean;
}

const MetricsComponent: React.FC<MetricsProps> = ({
  metrics,
  isTrained,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-48">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
          <p className="text-gray-600">Calculating metrics...</p>
        </div>
      </div>
    );
  }

  if (!isTrained || !metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
        <p className="text-gray-600">
          Train the model to see performance metrics (R², RMSE, MAE)
        </p>
      </div>
    );
  }

  const getQualityAssessment = (r2: number): { label: string; color: string } => {
    if (r2 >= 0.8) return { label: 'Excellent', color: 'text-green-600' };
    if (r2 >= 0.6) return { label: 'Good', color: 'text-blue-600' };
    if (r2 >= 0.4) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  const quality = getQualityAssessment(metrics.r2_score);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* R² Score */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">R² Score</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.r2_score.toFixed(4)}</p>
            </div>
            <div className={`text-sm font-semibold ${quality.color}`}>
              {quality.label}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Explains {(metrics.r2_score * 100).toFixed(1)}% of variance
          </p>
        </div>

        {/* RMSE */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded border border-green-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">RMSE (₹)</p>
          <p className="text-3xl font-bold text-green-600">{metrics.rmse.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-2">
            Average prediction error
          </p>
        </div>

        {/* MAE */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded border border-purple-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">MAE (₹)</p>
          <p className="text-3xl font-bold text-purple-600">{metrics.mae.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-2">
            Mean absolute error
          </p>
        </div>

        {/* Model Equation */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded border border-orange-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">Model Equation</p>
          <p className="text-sm font-mono text-orange-600 mt-2">
            P(t) = {metrics.coefficient.toFixed(4)} × P(t-1)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Intercept: {metrics.intercept.toFixed(4)}
          </p>
        </div>
      </div>

      <div className="p-3 bg-info-50 border border-info-200 rounded text-sm text-info-800">
        <p>
          <strong>How to interpret:</strong> The model explains {(metrics.r2_score * 100).toFixed(1)}% of historical price variations.
          RMSE and MAE indicate average prediction errors in rupees.
        </p>
      </div>
    </div>
  );
};

export default MetricsComponent;
