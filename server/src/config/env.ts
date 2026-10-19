import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/routebloom'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('routebloom_super_secret_jwt_key_development_2026_secure'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  INITIAL_SETUP_ENABLED: z.string().optional().default('false').transform((val) => val === 'true'),
  BOOTSTRAP_ADMIN_NAME: z.string().optional().default('Platform Administrator'),
  BOOTSTRAP_ADMIN_EMAIL: z.string().optional().default('admin@routebloom.com'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().optional().default('RouteBloom@Admin2026'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;
