import { useEffect, useState } from "react";
import * as LocationService from "expo-location";

export default function useLocation(): [number, number] | null {
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    let subscription: any;

    (async () => {
      const { status } =
        await LocationService.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const location = await LocationService.getCurrentPositionAsync({});

      subscription = await LocationService.watchPositionAsync(
        { accuracy: LocationService.Accuracy.High, timeInterval: 3000 },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation([latitude, longitude]);
        }
      );

      const { latitude, longitude } = location.coords;
      setLocation([latitude, longitude]);
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return location;
}
