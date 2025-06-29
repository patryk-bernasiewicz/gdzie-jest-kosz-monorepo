/* eslint-disable no-undef */
import { Image } from 'react-native';

import * as parts from './parts';

const userImageMarker = require('@/assets/images/person-marker-v2.png');

const userImageSource = Image.resolveAssetSource(userImageMarker);
const userImageUrl = userImageSource.uri;

const binImageMarker = require('@/assets/images/bin-marker-v2.png');
const binImageSource = Image.resolveAssetSource(binImageMarker);
const binImageUrl = binImageSource.uri;

const MIN_ZOOM = 18;
const MAX_ZOOM = 19;

export default function createLeafletHtml(
  latitude: number | undefined,
  longitude: number | undefined,
): string {
  const html = /*html*/ `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      ${parts.styleHtml}
    </head>
    <body>
      <div id="map"></div>
      <script>
        var selectionRangeTreshold = 0.000054; // ~6 meters

        // Interpolate variables from the "outside"
        var latitude = ${latitude} || 0;
        var longitude = ${longitude} || 0;
        var MAX_ZOOM = ${MAX_ZOOM};
        var MIN_ZOOM = ${MIN_ZOOM};
        var userImageUrl = '${userImageUrl}';
        var binImageUrl = '${binImageUrl}';

        var logger = function () {
          function log(message) {
            console.log('[WEBVIEW Log] ', message);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: message,
            }));
          }

          return { log: log };
        };
        var loggerInstance = logger();

        var contextMenuMarker = null;
        var closestBinMarker = null;

        var map = L
          .map('map', {
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            tap: false,
            zoomControl: false,
          });

        L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          maxZoom: MAX_ZOOM,
          minZoom: MIN_ZOOM,
        }).addTo(map);

        var userMarkerIcon = L.icon({
          iconUrl: userImageUrl,
          iconSize: [40, 40],
          className: 'user-marker',
        });

        var userMarker = L.marker(
          [latitude, longitude],
          {
            icon: userMarkerIcon,
          }
        ).addTo(map);

        var binMarkerIcon = L.icon({
          iconUrl: binImageUrl,
          iconSize: [35, 35],
          className: 'bin-marker',
        });
        var binMarkers = [];

        // # Internal handlers
        // - communicating with the native code using window.ReactNativeWebView.postMessage
        ${parts.handleMapLoadHtml}
        ${parts.handleDoubleClickHtml}

        // # External handlers for the injected JS
        ${parts.updateMapPositionHtml}
        ${parts.updateZoomHtml}
        ${parts.updateBinsHtml}
        ${parts.clearSelectedPosHtml}
        ${parts.markClosestBinHtml}

        map.setView(
          [latitude, longitude],
          MIN_ZOOM
        );
      </script>
    </body>
  </html>`;

  return html;
}
