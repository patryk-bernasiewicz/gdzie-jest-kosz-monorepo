import { Magnetometer } from "expo-sensors";
import { useCallback, useEffect, useState } from "react";

const MANGETOMETER_INTERVAL = 2000;

export default function useHeading() {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    Magnetometer.setUpdateInterval(MANGETOMETER_INTERVAL);
    const subscription = Magnetometer.addListener((data) => {
      if (!data) {
        return;
      }
      const { x, y } = data;

      let angleRad = Math.atan2(-x, y);
      if (angleRad < 0) {
        angleRad += 2 * Math.PI;
      }

      let angleDeg = angleRad * (180 / Math.PI);
      angleDeg = (angleDeg + 360) % 360;

      setHeading(angleDeg);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return heading;
}
