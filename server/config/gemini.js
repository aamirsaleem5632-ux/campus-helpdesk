import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Gemini Client Configuration & Quota Management
 */

const MODELS_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

class GeminiManager {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.client = null;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      lastLatencyMs: 0,
      activeModel: MODELS_PRIORITY[0]
    };

    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err.message);
      }
    }
  }

  isConfigured() {
    return Boolean(this.client && this.apiKey);
  }

  getMetrics() {
    return {
      ...this.metrics,
      isConfigured: this.isConfigured()
    };
  }

  /**
   * Safe generation with retry, exponential backoff, and model fallback
   */
  async generateStructuredJSON({ systemInstruction, prompt, schemaDescription, agentName = 'Agent' }) {
    this.metrics.totalRequests++;
    const startTime = Date.now();

    if (!this.isConfigured()) {
      throw new Error(`GEMINI_NOT_CONFIGURED: GEMINI_API_KEY is missing in server/.env. Please configure your free-tier key.`);
    }

    const fullPrompt = `${systemInstruction}\n\nIMPORTANT: Return ONLY a valid JSON object matching this schema:\n${schemaDescription}\n\nUSER INPUT:\n${prompt}`;

    let lastError = null;

    for (const model of MODELS_PRIORITY) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await this.client.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2 // low temperature for deterministic, factual outputs
            }
          });

          const latency = Date.now() - startTime;
          this.metrics.lastLatencyMs = latency;
          this.metrics.successfulRequests++;
          this.metrics.activeModel = model;

          const text = response.text || '';
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          return {
            data: parsed,
            model,
            latencyMs: latency,
            agentName
          };
        } catch (err) {
          lastError = err;
          const status = err.status || err.code;
          const isQuota = status === 429 || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('Quota');

          if (isQuota) {
            this.metrics.rateLimitedRequests++;
            const backoffMs = attempt * 1200; // wait 1.2s, 2.4s before retry
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          } else {
            // Try fallback model if model not supported or other server error
            break;
          }
        }
      }
    }

    this.metrics.failedRequests++;
    throw new Error(`Gemini API Error in [${agentName}]: ${lastError?.message || 'Failed after retries'}`);
  }
}

export const gemini = new GeminiManager();

