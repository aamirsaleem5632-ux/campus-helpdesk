import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import { gemini } from './config/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'University Helpdesk Multi-Agent Backend',
    geminiConfigured: gemini.isConfigured(),
    activeModel: gemini.metrics.activeModel,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/agents', agentRoutes);

// Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Start Server only if executed directly (e.g. node server/server.js)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase();
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎓 University Helpdesk Multi-Agent Server running on port ${PORT}`);
    console.log(`🤖 Gemini API configured: ${gemini.isConfigured() ? 'YES (Free Tier)' : 'NO (Add GEMINI_API_KEY to server/.env)'}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
