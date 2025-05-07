export const handleDoubleClickHtml = /* js */ `
  // -- Handle double click
  map.on('dblclick', function(event) {
    if (contextMenuMarker) {
      map.removeLayer(contextMenuMarker);
      contextMenuMarker = null;
    }
    var latlng = event.latlng.lat + ', ' + event.latlng.lng;
    var screenPos = event.containerPoint.x + ', ' + event.containerPoint.y;

    contextMenuMarker = L.marker(event.latlng, {
      icon: L.divIcon({
        className: 'context-menu-marker',
      }),
    }).setZIndexOffset(1000).addTo(map);

    var foundMarkers = [];
    try {
      for (var i = 0; i < binMarkers.length; i++) {
        var currentMarker = binMarkers[i];

        var markerId = currentMarker.id;
        var markerLatLng = currentMarker.getLatLng();
        var markerLat = markerLatLng.lat;
        var markerLng = markerLatLng.lng;

        if (
          Math.abs(markerLatLng.lat - event.latlng.lat) < selectionRangeTreshold &&
          Math.abs(markerLatLng.lng - event.latlng.lng) < selectionRangeTreshold
        ) {
          foundMarkers.push(markerId);
        }
      }
      loggerInstance.log('Found markers around selected point: ' + JSON.stringify(foundMarkers, null, 2));
    } catch (e) {
      loggerInstance.log('Error while searching for markers: ' + e.message, e);
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'contextmenu',
      latlng: { lat: event.latlng.lat, lng: event.latlng.lng },
      screenPos: {  x: event.containerPoint.x, y: event.containerPoint.y },
      selectedBins: foundMarkers,
    }));
  });
`;
