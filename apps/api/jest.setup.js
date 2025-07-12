import { Logger } from '@nestjs/common';

// Silence all NestJS logger output during tests
Logger.overrideLogger(false);

// Also mock Logger prototype methods to silence instantiated loggers
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});
