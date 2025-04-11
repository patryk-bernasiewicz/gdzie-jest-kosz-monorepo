import { renderHook } from "@testing-library/react-native";
import useNearestBin from "../useNearestBin";
import { BinWithDistance } from "@/types/BinWithDistance";

// Mock useLocation
jest.mock("../useLocation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useLocation from "../useLocation";

// Mock getNearestBin
jest.mock("@/lib/getNearestBin", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getNearestBin from "@/lib/getNearestBin";

describe("useNearestBin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null if location is not available", () => {
    (useLocation as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useNearestBin([]));
    expect(result.current).toBeNull();
  });

  it("returns null if bins array is empty", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const { result } = renderHook(() => useNearestBin([]));
    expect(result.current).toBeNull();
  });

  it("returns null if bins is undefined", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const { result } = renderHook(() => useNearestBin(undefined));
    expect(result.current).toBeNull();
  });

  it("returns the nearest bin if location and bins are available", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const bins = [
      {
        id: 1,
        latitude: 52.1005,
        longitude: 21.0005,
        distance: 10,
      } as BinWithDistance,
      {
        id: 2,
        latitude: 53.0,
        longitude: 22.0,
        distance: null,
      } as BinWithDistance,
    ];

    (getNearestBin as jest.Mock).mockReturnValue(bins[0]);

    const { result } = renderHook(() => useNearestBin(bins));
    expect(result.current).toEqual(bins[0]);
    expect(getNearestBin).toHaveBeenCalledWith(bins, 52.1, 21.0);
  });

  it("returns null if getNearestBin returns null", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const bins = [
      {
        id: 1,
        latitude: 52.1005,
        longitude: 21.0005,
        distance: 10,
      } as BinWithDistance,
      {
        id: 2,
        latitude: 53.0,
        longitude: 22.0,
        distance: null,
      } as BinWithDistance,
    ];

    (getNearestBin as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useNearestBin(bins));
    expect(result.current).toBeNull();
  });
});
