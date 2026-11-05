import { gemini } from '../config/gemini.js';

/**
 * Base Agent Class
 * Encapsulates common telemetry, retry, and structured execution.
 */
export class BaseAgent {
  constructor({ name, role, systemInstruction, schemaDescription }) {
    this.name = name;
    this.role = role;
    this.systemInstruction = systemInstruction;
    this.schemaDescription = schemaDescription;
    this.status = 'IDLE';
    this.lastResult = null;
    this.lastLatencyMs = 0;
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      lastLatencyMs: this.lastLatencyMs,
      hasResult: Boolean(this.lastResult)
    };
  }

  async run(input, context = {}) {
    this.status = 'ACTIVE';
    const start = Date.now();

    try {
      let resultData;

      if (gemini.isConfigured()) {
        const response = await gemini.generateStructuredJSON({
          systemInstruction: this.systemInstruction,
          prompt: typeof input === 'string' ? input : JSON.stringify(input),
          schemaDescription: this.schemaDescription,
          agentName: this.name
        });
        resultData = response.data;
      } else {
        // Deterministic University Rule-Based Engine when API key is not configured (e.g., in unit tests)
        resultData = await this.fallbackRuleEngine(input, context);
      }

      this.lastLatencyMs = Date.now() - start;
      this.status = 'COMPLETED';
      this.lastResult = resultData;

      return {
        agent: this.name,
        role: this.role,
        status: 'SUCCESS',
        latencyMs: this.lastLatencyMs,
        data: resultData
      };
    } catch (err) {
      this.lastLatencyMs = Date.now() - start;
      this.status = 'ERROR';
      throw new Error(`[${this.name}] Execution Failed: ${err.message}`, { cause: err });
    }
  }

  /**
   * Deterministic fallback rule-based execution for offline & testing mode
   */
  async fallbackRuleEngine(_input, _context) {
    throw new Error(`Rule engine not implemented for ${this.name}`);
  }
}

