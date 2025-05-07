export const updateMapPositionHtml = /* js */ `
  // -- Update position
  window.updateMapPosition = function(lat, lng) {
    //loggerInstance.log('Map position updated to: ' + lat + ', ' + lng);
    map.setView([lat, lng], map.getZoom());
    userMarker.setLatLng([lat, lng]);
  };
`;
