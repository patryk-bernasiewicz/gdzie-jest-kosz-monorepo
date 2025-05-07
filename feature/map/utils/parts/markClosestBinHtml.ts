export const markClosestBinHtml = /* js */ `
  // -- Mark bin marker as the closest
  window.markClosestBin = function(binId) {
    //loggerInstance.log('Marking bin ' + binId + ' as closest');
    if (closestBinMarker) {
      closestBinMarker._icon.classList.remove('closest-bin-marker');
    }
    closestBinMarker = binMarkers.find((marker) => marker.id === binId);
    if (closestBinMarker) {
      closestBinMarker._icon.classList.add('closest-bin-marker');
    }
  }
`;
