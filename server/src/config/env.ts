import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root (parent of server/)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback to server/.env if it exists

function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  PORT: parseInt(process.env['PORT'] ?? '3001', 10),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  DATABASE_URL: require('DATABASE_URL'),
  CLERK_SECRET_KEY: require('CLERK_SECRET_KEY'),
  GROQ_API_KEY: require('GROQ_API_KEY'),
  ALLOWED_ORIGINS: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173').split(','),
  // Optional external fallback (OpenAI, Together AI, Cerebras, etc.)
  FALLBACK_API_KEY:  process.env['FALLBACK_API_KEY'],
  FALLBACK_BASE_URL: process.env['FALLBACK_BASE_URL'],
  FALLBACK_MODEL:    process.env['FALLBACK_MODEL'],
};
