export const updateBinsHtml = /* js */ `
  // -- Update bins
  window.updateBins = function(bins) {
    // loggerInstance.log('Bins updated: ' + JSON.stringify(bins, null, 2));

    // remove far away bins
    var binsToRemove = binMarkers.filter((marker) => {
      return !bins.find((bin) => bin.id === marker.id);
    });
    binsToRemove.forEach((marker) => {
      map.removeLayer(marker);
    });

    bins.forEach((bin) => {
      var exists = binMarkers.find((marker) => marker.id === bin.id);
      if (!exists) {
        var marker = L.marker([bin.latitude, bin.longitude], {
          icon: binMarkerIcon,
        }).setZIndexOffset(100).addTo(map);
        marker.id = bin.id;
        binMarkers.push(marker);
      }
    });
  }
`;
