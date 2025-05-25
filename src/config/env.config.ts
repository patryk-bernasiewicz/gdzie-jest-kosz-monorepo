import { existsSync } from 'fs';
import { Logger } from '@nestjs/common';

/**
 * Environment configuration helper
 * Determines which environment files to load based on NODE_ENV and other factors
 */
export function getEnvFilePaths(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPaths: string[] = [];

  const logger = new Logger('EnvConfig');

  logger.log(`🔧 Loading environment configuration for NODE_ENV: ${nodeEnv}`);

  // Priority order for environment files
  // Higher priority files are loaded first and can override lower priority ones

  if (nodeEnv === 'development') {
    // Development-specific config
    envPaths.push('.env.development');
  }

  if (nodeEnv === 'test') {
    envPaths.push('.env.test');
    envPaths.push('.env.test.local');
  }

  if (nodeEnv === 'production') {
    envPaths.push('.env.production');
    envPaths.push('.env.production.local');
  }

  // Always include base .env as fallback
  envPaths.push('.env');

  // Filter to only existing files and log which ones are found
  const existingPaths = envPaths.filter((path) => {
    const exists = existsSync(path);
    if (exists) {
      logger.log(`📁 Found env file: ${path}`);
    }
    return exists;
  });

  if (existingPaths.length === 0) {
    logger.warn('⚠️  No environment files found, using process.env only');
  }

  return existingPaths;
}

/**
 * Configuration options for different environments
 */
export function getConfigOptions() {
  return {
    envFilePath: getEnvFilePaths(),
    isGlobal: true,
    // Expand variables like ${VAR} in env files
    expandVariables: true,
    // Cache the configuration
    cache: true,
  };
}
