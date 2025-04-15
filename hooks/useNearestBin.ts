import getNearestBin from "@/lib/getNearestBin";
import { BinWithDistance } from "@/types/BinWithDistance";
import { useMemo } from "react";
import useLocation from "./useLocation";
import { WorldDirection } from "@/types/WorldDirection";

export default function useNearestBin(bins?: BinWithDistance[] | null): {
  nearestBin: BinWithDistance | null;
  nearestBinDirection: WorldDirection | null;
} {
  const { location } = useLocation();

  const nearestBin = useMemo(() => {
    if (!bins || bins.length === 0 || !location || !location[0] || !location[1])
      return null;

    return getNearestBin(bins, location[0], location[1]);
  }, [bins, location]);

  const nearestBinDirection = useMemo<WorldDirection | null>(() => {
    let direction = "";

    if (nearestBin && location) {
      const [latitude, longitude] = location;
      const { latitude: binLat, longitude: binLng } = nearestBin;

      if (binLat > latitude) direction += "north";
      else if (binLat < latitude) direction += "south";

      if (binLng > longitude) direction += direction ? "east" : "east";
      else if (binLng < longitude) direction += direction ? "west" : "west";

      if (!direction) direction = "here";
    }

    return direction.length ? (direction as WorldDirection) : null;
  }, [nearestBin, location]);

  return { nearestBin, nearestBinDirection };
}
