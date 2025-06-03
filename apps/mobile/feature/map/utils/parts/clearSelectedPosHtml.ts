export const clearSelectedPosHtml = /* js */ `
  // -- Clear selected position
  window.clearSelectedPos = function() {
    //loggerInstance.log('Clearing selected position');
    if (contextMenuMarker) {
      map.removeLayer(contextMenuMarker);
      contextMenuMarker = null;
    }
  }
`;
