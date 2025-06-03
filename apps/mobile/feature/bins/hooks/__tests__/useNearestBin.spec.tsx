import { renderHook } from '@testing-library/react-native';

import getNearestBin from '../../../bins/utils/getNearestBin';
import useLocation from '../../../map/hooks/useLocation';
import useNearestBin from '../useNearestBin';

jest.mock('../../../map/hooks/useLocation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../bins/utils/getNearestBin', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useNearestBin', () => {
  let queryClient: import('@tanstack/react-query').QueryClient;
  let QueryClientProvider: typeof import('@tanstack/react-query').QueryClientProvider;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ QueryClientProvider } = require('@tanstack/react-query'));
    queryClient = new (require('@tanstack/react-query').QueryClient)({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchInterval: false,
          staleTime: Infinity,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  afterEach(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  });

  function mockLocation(location: [number, number] | null) {
    (useLocation as jest.Mock).mockReturnValue({ location });
  }

  it('returns nulls if location is not available', () => {
    mockLocation(null);
    const { result } = renderHook(() => useNearestBin([]), { wrapper });
    expect(result.current).toEqual({
      nearestBin: null,
      nearestBinDirection: null,
    });
  });

  it('returns nulls if bins array is empty', () => {
    mockLocation([52.1, 21.0]);
    const { result } = renderHook(() => useNearestBin([]), { wrapper });
    expect(result.current).toEqual({
      nearestBin: null,
      nearestBinDirection: null,
    });
  });

  it('returns nulls if bins is undefined', () => {
    mockLocation([52.1, 21.0]);
    const { result } = renderHook(() => useNearestBin(undefined), { wrapper });
    expect(result.current).toEqual({
      nearestBin: null,
      nearestBinDirection: null,
    });
  });

  it('returns the nearest bin and direction if location and bins are available', () => {
    mockLocation([52.1, 21.0]);
    const bins = [
      {
        id: 1,
        latitude: 52.1005,
        longitude: 21.0005,
        distance: 10,
        type: 'bin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 2,
        latitude: 53.0,
        longitude: 22.0,
        distance: null,
        type: 'bin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    (getNearestBin as jest.Mock).mockReturnValue(bins[0]);
    const { result } = renderHook(() => useNearestBin(bins), { wrapper });
    expect(result.current).toEqual({
      nearestBin: bins[0],
      nearestBinDirection: 'northeast', // 52.1005 > 52.1, 21.0005 > 21.0
    });
    expect(getNearestBin).toHaveBeenCalledWith(bins, 52.1, 21.0);
  });

  it('returns null direction if nearestBin is null', () => {
    mockLocation([52.1, 21.0]);
    const bins = [
      {
        id: 1,
        latitude: 52.1005,
        longitude: 21.0005,
        distance: 10,
        type: 'bin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    (getNearestBin as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => useNearestBin(bins), { wrapper });
    expect(result.current).toEqual({
      nearestBin: null,
      nearestBinDirection: null,
    });
  });

  it('returns correct direction for various positions', () => {
    mockLocation([52.1, 21.0]);
    const baseBin = {
      id: 1,
      distance: 10,
      type: 'bin' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const testCases = [
      {
        bin: { ...baseBin, latitude: 52.1, longitude: 21.0 },
        expected: 'here',
      },
      {
        bin: { ...baseBin, latitude: 52.2, longitude: 21.0 },
        expected: 'north',
      },
      {
        bin: { ...baseBin, latitude: 52.0, longitude: 21.0 },
        expected: 'south',
      },
      {
        bin: { ...baseBin, latitude: 52.1, longitude: 22.0 },
        expected: 'east',
      },
      {
        bin: { ...baseBin, latitude: 52.1, longitude: 20.0 },
        expected: 'west',
      },
      {
        bin: { ...baseBin, latitude: 52.2, longitude: 22.0 },
        expected: 'east',
      },
      {
        bin: { ...baseBin, latitude: 52.2, longitude: 20.0 },
        expected: 'west',
      },
      {
        bin: { ...baseBin, latitude: 52.0, longitude: 22.0 },
        expected: 'east',
      },
      {
        bin: { ...baseBin, latitude: 52.0, longitude: 20.0 },
        expected: 'west',
      },
    ];
    for (const { bin, expected } of testCases) {
      (getNearestBin as jest.Mock).mockReturnValue(bin);
      const { result } = renderHook(() => useNearestBin([bin]), { wrapper });
      expect(result.current.nearestBinDirection).toBe(expected);
    }
  });
});
