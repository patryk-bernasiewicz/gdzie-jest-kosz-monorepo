import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useBins from "../useBins";

// Mock useLocation
jest.mock("../useLocation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useLocation from "../useLocation";

describe("useBins", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("does not fetch bins if location is not available", async () => {
    (useLocation as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useBins(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  it("fetches bins if location is available", async () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, latitude: 52.1, longitude: 21.0 }],
    });

    const { result } = renderHook(() => useBins(), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual([
      { id: 1, latitude: 52.1, longitude: 21.0 },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/bins/?latitude=52.1&longitude=21`)
    );
  });

  it("handles fetch errors gracefully", async () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const fetchTemp = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => useBins(), { wrapper });

    await waitFor(
      () => {
        console.log(result.current.isError);
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network response was not ok");

    global.fetch = fetchTemp; // Restore the original fetch function
  });

  it("does not fetch if binsUrl is null", async () => {
    (useLocation as jest.Mock).mockReturnValue([null, null]);

    const { result } = renderHook(() => useBins(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });
});
