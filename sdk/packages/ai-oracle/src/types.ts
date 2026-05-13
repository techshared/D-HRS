/**
 * D-HRS AI Oracle Types
 */

export interface PredictionRequest {
  features: Record<string, number>;
  modelType: ModelType;
}

export interface PredictionResult {
  value: number;
  confidence: number;
  modelVersion: string;
  proof: string;
  timestamp: Date;
}

export type ModelType = 
  | 'salary_predictor'
  | 'performance_analyzer'
  | 'attrition_predictor';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
}

export interface OracleResponse {
  success: boolean;
  prediction?: PredictionResult;
  error?: string;
}
