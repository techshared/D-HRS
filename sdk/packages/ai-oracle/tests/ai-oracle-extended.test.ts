/**
 * D-HRS AI Oracle - Extended Tests
 */

import { AIOracle } from '../src/index';

describe('D-HRS AI Oracle - Extended Tests', () => {
  let oracle: AIOracle;

  beforeEach(() => {
    oracle = new AIOracle();
  });

  describe('Model Training Edge Cases', () => {
    it('should handle small dataset', async () => {
      const data = {
        features: [[1, 2, 3, 4, 5]],
        labels: [100000]
      };

      const metrics = await oracle.trainModel('salary_predictor', data);
      expect(metrics).toBeDefined();
      expect(metrics.accuracy).toBeDefined();
    });

    it('should handle large dataset', async () => {
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 1000; i++) {
        features.push([
          Math.random() * 20,
          Math.floor(Math.random() * 4) + 1,
          Math.random() * 100,
          Math.random() * 5,
          Math.random() * 100
        ]);
        labels.push(30000 + Math.random() * 200000);
      }

      const metrics = await oracle.trainModel('salary_predictor', { features, labels });
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
    });

    it('should handle identical features', async () => {
      const data = {
        features: [[5, 3, 80, 4, 70], [5, 3, 80, 4, 70], [5, 3, 80, 4, 70]],
        labels: [100000, 100000, 100000]
      };

      const metrics = await oracle.trainModel('salary_predictor', data);
      expect(metrics).toBeDefined();
    });
  });

  describe('Prediction Edge Cases', () => {
    beforeEach(async () => {
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        features.push([5, 3, 80, 4, 70]);
        labels.push(100000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });
    });

    it('should handle zero features', async () => {
      const result = await oracle.predict({
        features: {
          experience_years: 0,
          education_level: 0,
          skill_score: 0,
          performance_rating: 0,
          market_demand: 0
        },
        modelType: 'salary_predictor'
      });

      expect(result.success).toBe(true);
    });

    it('should handle maximum features', async () => {
      const result = await oracle.predict({
        features: {
          experience_years: 50,
          education_level: 10,
          skill_score: 100,
          performance_rating: 5,
          market_demand: 100
        },
        modelType: 'salary_predictor'
      });

      expect(result.success).toBe(true);
      expect(result.prediction!.value).toBeDefined();
    });

    it('should handle negative features', async () => {
      const result = await oracle.predict({
        features: {
          experience_years: -1,
          education_level: 0,
          skill_score: 0,
          performance_rating: 0,
          market_demand: 0
        },
        modelType: 'salary_predictor'
      });

      expect(result.success).toBe(true);
    });

    it('should generate unique proofs', async () => {
      const result1 = await oracle.predict({
        features: { experience_years: 5, education_level: 3, skill_score: 80, performance_rating: 4, market_demand: 70 },
        modelType: 'salary_predictor'
      });

      const result2 = await oracle.predict({
        features: { experience_years: 10, education_level: 4, skill_score: 90, performance_rating: 5, market_demand: 80 },
        modelType: 'salary_predictor'
      });

      expect(result1.prediction!.proof).not.toBe(result2.prediction!.proof);
    });
  });

  describe('Proof Verification Edge Cases', () => {
    it('should reject proof with invalid value', async () => {
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        features.push([5, 3, 80, 4, 70]);
        labels.push(100000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });

      const result = await oracle.predict({
        features: { experience_years: 5, education_level: 3, skill_score: 80, performance_rating: 4, market_demand: 70 },
        modelType: 'salary_predictor'
      });

      // Tamper with value
      const tamperedPrediction = { ...result.prediction!, value: -1000 };
      const isValid = await oracle.verifyProof(tamperedPrediction, {});
      expect(isValid).toBe(false);
    });

    it('should reject proof with invalid confidence', async () => {
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        features.push([5, 3, 80, 4, 70]);
        labels.push(100000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });

      const result = await oracle.predict({
        features: { experience_years: 5, education_level: 3, skill_score: 80, performance_rating: 4, market_demand: 70 },
        modelType: 'salary_predictor'
      });

      // Tamper with confidence
      const tamperedPrediction = { ...result.prediction!, confidence: 1.5 };
      const isValid = await oracle.verifyProof(tamperedPrediction, {});
      expect(isValid).toBe(false);
    });
  });

  describe('Model Info Edge Cases', () => {
    it('should list all models', () => {
      const models = oracle.listModels();
      expect(models).toContain('salary_predictor');
    });

    it('should get model info before training', () => {
      const info = oracle.getModelInfo('salary_predictor');
      expect(info.trained).toBe(false);
    });

    it('should get model info after training', async () => {
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        features.push([5, 3, 80, 4, 70]);
        labels.push(100000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });

      const info = oracle.getModelInfo('salary_predictor');
      expect(info.trained).toBe(true);
    });
  });
});
