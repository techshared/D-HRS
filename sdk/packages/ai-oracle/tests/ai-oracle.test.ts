/**
 * D-HRS AI Oracle Tests
 */

import { AIOracle } from '../src/index';

describe('D-HRS AI Oracle', () => {
  let oracle: AIOracle;

  beforeEach(() => {
    oracle = new AIOracle();
  });

  describe('Model Management', () => {
    it('should list available models', () => {
      const models = oracle.listModels();
      expect(models).toContain('salary_predictor');
    });

    it('should get model info', () => {
      const info = oracle.getModelInfo('salary_predictor');
      expect(info).toBeDefined();
      expect(info.type).toBe('salary_predictor');
      expect(info.trained).toBe(false);
    });

    it('should throw error for non-existent model', () => {
      expect(() => oracle.getModelInfo('non_existent' as any)).toThrow();
    });
  });

  describe('Salary Predictor', () => {
    it('should train the model', async () => {
      // Generate training data
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 100; i++) {
        const experience = Math.random() * 20;
        const education = Math.floor(Math.random() * 4) + 1;
        const skillScore = Math.random() * 100;
        const performance = Math.random() * 5;
        const marketDemand = Math.random() * 100;
        
        features.push([experience, education, skillScore, performance, marketDemand]);
        
        // Simple salary formula
        const salary = 30000 + 
          experience * 3000 + 
          education * 5000 + 
          skillScore * 200 + 
          performance * 10000 + 
          marketDemand * 100;
        
        labels.push(salary);
      }

      const metrics = await oracle.trainModel('salary_predictor', { features, labels });

      expect(metrics).toBeDefined();
      expect(metrics.accuracy).toBeGreaterThan(0);
    });

    it('should make prediction after training', async () => {
      // Train first
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        const exp = Math.random() * 15;
        features.push([exp, 2, 70, 3.5, 60]);
        labels.push(30000 + exp * 3000 + 10000 + 7000 + 6000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });

      // Make prediction
      const result = await oracle.predict({
        features: {
          experience_years: 5,
          education_level: 2,
          skill_score: 70,
          performance_rating: 3.5,
          market_demand: 60
        },
        modelType: 'salary_predictor'
      });

      expect(result.success).toBe(true);
      expect(result.prediction).toBeDefined();
      expect(result.prediction!.value).toBeDefined();
      expect(result.prediction!.confidence).toBeGreaterThan(0);
      expect(result.prediction!.proof).toBeDefined();
    });

    it('should fail prediction without training', async () => {
      const result = await oracle.predict({
        features: { experience_years: 5 },
        modelType: 'salary_predictor'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not trained');
    });
  });

  describe('Proof Verification', () => {
    it('should verify valid proof', async () => {
      // Train model
      const features = [];
      const labels = [];
      
      for (let i = 0; i < 50; i++) {
        features.push([5, 3, 80, 4, 70]);
        labels.push(100000);
      }

      await oracle.trainModel('salary_predictor', { features, labels });

      const result = await oracle.predict({
        features: {
          experience_years: 5,
          education_level: 3,
          skill_score: 80,
          performance_rating: 4.0,
          market_demand: 70
        },
        modelType: 'salary_predictor'
      });

      const isValid = await oracle.verifyProof(result.prediction!, {
        experience_years: 5,
        education_level: 3,
        skill_score: 80,
        performance_rating: 4.0,
        market_demand: 70
      });

      expect(isValid).toBe(true);
    });
  });
});
