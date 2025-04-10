import getNearestBin from "@/lib/getNearestBin";
import { BinWithDistance } from "@/types/BinWithDistance";
import { useMemo } from "react";
import useLocation from "./useLocation";

export default function useNearestBin(
  bins?: BinWithDistance[] | null
): BinWithDistance | null {
  const location = useLocation();

  return useMemo(() => {
    if (!bins || bins.length === 0 || !location || !location[0] || !location[1])
      return null;

    const nearestBin = getNearestBin(bins, location[0], location[1]);

    return nearestBin;
  }, [bins, location]);
}
