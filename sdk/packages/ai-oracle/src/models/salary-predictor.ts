/**
 * D-HRS Salary Predictor Model
 * Simple linear regression for salary prediction
 */

import { PredictionResult, ModelMetrics } from '../types';
import * as crypto from 'crypto';

export class SalaryPredictor {
  private weights: number[] = [];
  private bias: number = 0;
  private modelVersion: string = '1.0.0';
  private trained: boolean = false;

  // Feature mapping
  private featureNames = [
    'experience_years',
    'education_level',
    'skill_score',
    'performance_rating',
    'market_demand'
  ];

  /**
   * Train the model
   */
  async train(data: { features: number[][]; labels: number[] }): Promise<ModelMetrics> {
    const { features, labels } = data;
    const n = features.length;
    const numFeatures = features[0].length;

    // Initialize weights
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    // Simple gradient descent
    const learningRate = 0.001;
    const epochs = 1000;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < n; i++) {
        const prediction = this.predict_raw(features[i]);
        const error = prediction - labels[i];
        totalLoss += error * error;

        // Update weights
        for (let j = 0; j < numFeatures; j++) {
          this.weights[j] -= learningRate * error * features[i][j];
        }
        this.bias -= learningRate * error;
      }

      // Early stopping if loss is small enough
      if (totalLoss / n < 1000) break;
    }

    this.trained = true;

    // Calculate metrics
    const metrics = this.calculateMetrics(features, labels);
    return metrics;
  }

  /**
   * Predict salary
   */
  async predict(features: Record<string, number>): Promise<PredictionResult> {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const featureVector = this.featureNames.map(name => features[name] || 0);
    const value = this.predict_raw(featureVector);
    const confidence = this.calculateConfidence(featureVector);

    // Generate proof
    const proof = this.generateProof(featureVector, value);

    return {
      value: Math.round(value),
      confidence,
      modelVersion: this.modelVersion,
      proof,
      timestamp: new Date()
    };
  }

  /**
   * Raw prediction
   */
  private predict_raw(features: number[]): number {
    let sum = this.bias;
    for (let i = 0; i < features.length; i++) {
      sum += this.weights[i] * features[i];
    }
    return sum;
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(features: number[]): number {
    // Simple confidence based on feature values
    const avgFeature = features.reduce((a, b) => a + b, 0) / features.length;
    return Math.min(0.95, 0.5 + avgFeature / 200);
  }

  /**
   * Generate proof for on-chain verification
   */
  private generateProof(features: number[], prediction: number): string {
    const proofData = {
      modelVersion: this.modelVersion,
      features,
      prediction,
      timestamp: Date.now()
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(proofData))
      .digest('hex');
  }

  /**
   * Calculate model metrics
   */
  private calculateMetrics(features: number[][], labels: number[]): ModelMetrics {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const threshold = 100000; // Salary threshold

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict_raw(features[i]);
      const actual = labels[i];

      if (prediction >= threshold && actual >= threshold) tp++;
      else if (prediction >= threshold && actual < threshold) fp++;
      else if (prediction < threshold && actual >= threshold) fn++;
      else tn++;
    }

    const accuracy = (tp + tn) / (tp + fp + tn + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score };
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      type: 'salary_predictor',
      version: this.modelVersion,
      trained: this.trained,
      features: this.featureNames
    };
  }
}
