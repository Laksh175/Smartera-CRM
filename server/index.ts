import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/connection.js';
import { apiRouter } from './routes/api.router.js';
import { errorHandler } from './middlewares/error.js';
import { startCronScheduler } from './cron/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body parsing
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SMARTERA DIGITAL CRM Backend',
    timestamp: new Date().toISOString(),
  });
});

// REST API Router
app.use('/api', apiRouter);

// Centralized Error Handler
app.use(errorHandler);

// Start Server after Database Sync
async function bootstrap() {
  await db.whenReady();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SMARTERA DIGITAL CRM API Server running on port ${PORT}`);
    console.log(`🔗 Local API: http://localhost:${PORT}/api`);
    console.log(`🩺 Health:    http://localhost:${PORT}/health`);
    console.log(`======================================================\n`);

    // Start Automated Reminders Cron Engine
    startCronScheduler();
  });
}

bootstrap();

export default app;
