import { ClerkClientProvider } from './clerk-client.provider';

describe('ClerkClientProvider', () => {
  let configService: { get: jest.Mock };
  let createClerkClient: jest.Mock;

  beforeEach(() => {
    configService = { get: jest.fn() };
    createClerkClient = jest.fn();
  });

  it('should create Clerk client with correct keys from config', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'CLERK_PUBLISHABLE_KEY') return 'pub_key';
      if (key === 'CLERK_SECRET_KEY') return 'sec_key';
      return undefined;
    });
    jest.resetModules();
    jest.doMock('@clerk/backend', () => ({
      createClerkClient: createClerkClient,
    }));
    // Re-import after mocking
    const {
      ClerkClientProvider: Provider,
    } = require('./clerk-client.provider');
    Provider.useFactory(configService as any);
    expect(createClerkClient).toHaveBeenCalledWith({
      publishableKey: 'pub_key',
      secretKey: 'sec_key',
    });
  });

  it('should handle missing config keys gracefully', () => {
    configService.get.mockReturnValue(undefined);
    jest.resetModules();
    jest.doMock('@clerk/backend', () => ({
      createClerkClient: createClerkClient,
    }));
    const {
      ClerkClientProvider: Provider,
    } = require('./clerk-client.provider');
    Provider.useFactory(configService as any);
    expect(createClerkClient).toHaveBeenCalledWith({
      publishableKey: undefined,
      secretKey: undefined,
    });
  });
});
