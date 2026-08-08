import { MockAIService } from './mock-ai-service';
import { GeminiAIService } from './gemini-services'; 

export interface AIService {
  getDiagnosis(image: string, description: string, apiKey: string): Promise<any>;
}

export function getAIService(useRealAI = true): AIService {
  return useRealAI ? (new GeminiAIService() as any) : (new MockAIService() as any);
}