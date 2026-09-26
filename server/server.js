import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
let httpServer;

const startServer = async () => {
  try {
    await connectDatabase();
    httpServer = app.listen(port, () => console.info(`API listening on port ${port}`));
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Stop the older server process, then run npm.cmd run dev again.`);
      else console.error(`HTTP server error: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.info(`${signal} received. Shutting down gracefully...`);
  if (!httpServer) return process.exit(0);
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => console.error('Unhandled promise rejection:', error));
process.on('uncaughtException', (error) => { console.error('Uncaught exception:', error); shutdown('uncaughtException'); });

startServer();
