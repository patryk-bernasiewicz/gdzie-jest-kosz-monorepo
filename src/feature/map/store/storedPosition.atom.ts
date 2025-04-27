import { atom, useAtom } from "jotai";
import { useEffect } from "react";

type MapPosition = {
  latitude: number | null;
  longitude: number | null;
};

const STORAGE_KEY = "map-latlng";

function getInitialPosition(): MapPosition {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { latitude: null, longitude: null };
    const { latitude, longitude } = JSON.parse(stored);
    return {
      latitude: typeof latitude === "number" ? latitude : null,
      longitude: typeof longitude === "number" ? longitude : null,
    };
  } catch (err) {
    console.error("Failed to read map lat/lng from storage:", err);
    return { latitude: null, longitude: null };
  }
}

const storedPositionAtom = atom<MapPosition>(getInitialPosition());

storedPositionAtom.onMount = (setAtom) => {
  const handleStorage = () => setAtom(getInitialPosition());
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
};

function useStoredPosition(
  latitude: number | string | null,
  longitude: number | string | null,
) {
  const [mapLatLng, setMapLatLng] = useAtom(storedPositionAtom);

  useEffect(() => {
    const latNum =
      typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lngNum =
      typeof longitude === "string" ? parseFloat(longitude) : longitude;
    if (
      latNum !== null &&
      lngNum !== null &&
      !isNaN(latNum) &&
      !isNaN(lngNum)
    ) {
      setMapLatLng({ latitude: latNum, longitude: lngNum });
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ latitude: latNum, longitude: lngNum }),
        );
      } catch (err) {
        console.error("Failed to save map lat/lng to storage:", err);
      }
    }
  }, [latitude, longitude, setMapLatLng]);

  return [mapLatLng] as const;
}

export default useStoredPosition;
