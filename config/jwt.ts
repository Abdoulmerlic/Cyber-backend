import { config } from 'dotenv';

config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '1d';