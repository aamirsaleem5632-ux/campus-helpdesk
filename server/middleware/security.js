/**
 * Security Middleware: Input Sanitization & Prompt Injection Protection
 */

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|unrestricted|an\s+unfiltered)/i,
  /system\s+prompt\s+(leak|reveal|show|dump)/i,
  /override\s+(all\s+)?(safety|security|policy|restrictions)/i,
  /print\s+your\s+(api\s*key|secret|hidden\s+token)/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
];

export const sanitizeAndProtect = (req, res, next) => {
  const queryText = req.body?.problemDescription || req.body?.description || req.body?.title || '';

  // 1. Length check to protect against DOS and token explosion
  if (typeof queryText === 'string' && queryText.length > 2500) {
    return res.status(400).json({
      error: 'INPUT_TOO_LONG',
      message: 'Description exceeds maximum allowed size (2500 characters).'
    });
  }

  // 2. Prompt Injection heuristics
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(queryText)) {
      return res.status(400).json({
        error: 'SUSPICIOUS_INPUT_DETECTED',
        message: 'Security Alert: Your input triggered safety guardrails against prompt manipulation. Please describe your university issue in plain language.'
      });
    }
  }

  next();
};

