import app from '../app.js';
import { connectDatabase } from '../config/db.js';

let databaseConnection;

const ensureDatabaseConnection = () => {
  if (!databaseConnection) {
    databaseConnection = connectDatabase().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }
  return databaseConnection;
};

export default async function handler(request, response) {
  try {
    await ensureDatabaseConnection();
    return app(request, response);
  } catch (error) {
    return response.status(500).json({ message: 'Database connection failed.' });
  }
}