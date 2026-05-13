/**
 * D-HRS AI Oracle - Main Entry Point
 */

import { SalaryPredictor } from './models/salary-predictor';
import { PredictionRequest, PredictionResult, OracleResponse, ModelType } from './types';

export class AIOracle {
  private salaryPredictor: SalaryPredictor;
  private models: Map<ModelType, any>;

  constructor() {
    this.salaryPredictor = new SalaryPredictor();
    this.models = new Map();
    this.models.set('salary_predictor', this.salaryPredictor);
  }

  /**
   * Train a model
   */
  async trainModel(
    modelType: ModelType,
    data: { features: number[][]; labels: number[] }
  ): Promise<any> {
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }

    return await model.train(data);
  }

  /**
   * Make a prediction
   */
  async predict(request: PredictionRequest): Promise<OracleResponse> {
    try {
      const model = this.models.get(request.modelType);
      if (!model) {
        return {
          success: false,
          error: `Model ${request.modelType} not found`
        };
      }

      const prediction = await model.predict(request.features);

      return {
        success: true,
        prediction
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Verify a prediction proof
   */
  async verifyProof(
    prediction: PredictionResult,
    features: Record<string, number>
  ): Promise<boolean> {
    // In production, verify the cryptographic proof
    // For now, basic validation
    if (!prediction.proof || prediction.proof.length !== 64) {
      return false;
    }

    if (prediction.value <= 0) {
      return false;
    }

    if (prediction.confidence < 0 || prediction.confidence > 1) {
      return false;
    }

    return true;
  }

  /**
   * Get model info
   */
  getModelInfo(modelType: ModelType): any {
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }

    return model.getModelInfo();
  }

  /**
   * List available models
   */
  listModels(): ModelType[] {
    return Array.from(this.models.keys());
  }
}

// Re-export types and classes
export * from './types';
export { SalaryPredictor } from './models/salary-predictor';
