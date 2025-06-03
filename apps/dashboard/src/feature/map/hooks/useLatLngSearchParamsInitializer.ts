import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGeolocation } from "./useGeolocation";
import useMapLatLng from "../store/storedPosition.atom";

export function useLatLngSearchParamsInitializer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const latitudeParam = searchParams.get("latitude");
  const longitudeParam = searchParams.get("longitude");
  const [lastMapPosition] = useMapLatLng(latitudeParam, longitudeParam);
  const geolocation = useGeolocation();

  useEffect(() => {
    if (!latitudeParam && !longitudeParam) {
      if (
        lastMapPosition.latitude !== null &&
        lastMapPosition.longitude !== null
      ) {
        setSearchParams({
          latitude: lastMapPosition.latitude.toString(),
          longitude: lastMapPosition.longitude.toString(),
        });
      } else if (geolocation.latitude && geolocation.longitude) {
        setSearchParams({
          latitude: geolocation.latitude.toString(),
          longitude: geolocation.longitude.toString(),
        });
      }
    }
  }, [
    latitudeParam,
    longitudeParam,
    geolocation.latitude,
    geolocation.longitude,
    lastMapPosition.latitude,
    lastMapPosition.longitude,
    setSearchParams,
  ]);

  return {
    latitude: parseFloat(latitudeParam || "0"),
    longitude: parseFloat(longitudeParam || "0"),
    lastMapPosition,
  };
}
