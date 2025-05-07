export const updateZoomHtml = /* js */ `
  // -- Update zoom
  window.updateMapZoom = function(zoom) {
    // loggerInstance.log('Zoom level changed to: ' + zoom);
    map.setZoom(zoom);
  };
`;
