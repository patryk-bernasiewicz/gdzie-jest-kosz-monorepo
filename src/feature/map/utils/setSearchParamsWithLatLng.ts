export const setSearchParamsWithLatLng = (
  setSearchParams: ReturnType<
    typeof import("react-router-dom").useSearchParams
  >[1],
  latitude: number | string,
  longitude: number | string
) => {
  const latNum = typeof latitude === "string" ? parseFloat(latitude) : latitude;
  const lngNum =
    typeof longitude === "string" ? parseFloat(longitude) : longitude;
  if (!isNaN(latNum) && !isNaN(lngNum)) {
    setSearchParams({
      latitude: latNum.toString(),
      longitude: lngNum.toString(),
    });
  }
};
