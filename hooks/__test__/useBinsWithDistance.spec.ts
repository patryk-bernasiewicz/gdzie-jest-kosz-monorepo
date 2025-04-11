import { renderHook } from "@testing-library/react-native";
import useBinsWithDistance from "../useBinsWithDistance";
import { Bin } from "@/types/Bin";

jest.mock("../useLocation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useLocation from "../useLocation";

describe("useBinsWithDistance", () => {
  it("returns null if location is not available", () => {
    (useLocation as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useBinsWithDistance([]));
    expect(result.current).toBeNull();
  });

  it("returns an empty array if bins is empty and location is available", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const { result } = renderHook(() => useBinsWithDistance([]));
    expect(result.current).toEqual([]);
  });

  it("calculates distance if bin is close enough", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);
    const bins: Bin[] = [
      { id: 1, latitude: 52.1005, longitude: 21.0005 } as Bin,
      { id: 2, latitude: 53.0, longitude: 22.0 } as Bin,
    ];

    const { result } = renderHook(() => useBinsWithDistance(bins));
    expect(result.current).toHaveLength(2);
    expect(result.current?.[0].distance).not.toBeNull();
    expect(result.current?.[1].distance).toBeNull();
  });

  it("handles null bins correctly", () => {
    (useLocation as jest.Mock).mockReturnValue([52.1, 21.0]);

    const { result } = renderHook(() => useBinsWithDistance(undefined));
    expect(result.current).toEqual([]);
  });
});
