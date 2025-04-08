import useBins from "@/hooks/useBins";
import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { WebView } from "react-native-webview";

const MIN_ZOOM = 18;
const MAX_ZOOM = 19;

type LeafletMapProps = {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  rotation?: number | null;
};

function LeafletMap({
  latitude = 51.505,
  longitude = -0.09,
  zoom = 13,
  rotation = 0,
}: LeafletMapProps) {
  const mapViewRef = useRef<WebView>(null);
  const bins = useBins();

  useEffect(() => {
    if (mapViewRef.current) {
      const js = `
        if (window.updateBins) {
          window.updateBins(JSON.parse('${JSON.stringify(bins.data || [])}'));
        }
      `;
      console.log("Injecting bins data into WebView", js);
      mapViewRef.current.injectJavaScript(js);
    }
  }, [bins.data]);

  useEffect(() => {
    if (mapViewRef.current) {
      mapViewRef.current.injectJavaScript(`
        if (window.updateMapPosition) {
          window.updateMapPosition(${latitude}, ${longitude});
        }
      `);
    }
  }, [latitude, longitude]);

  const leafletHtml = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <style>
            html, body, #map {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([51.505, -0.09], 13);
            var binMarkers = [];

            var logger = function () {
              function log(message) {
                window.ReactNativeWebView.postMessage(message);
              }

              return { log: log };
            };

            var loggerInstance = logger();

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              maxZoom: ${MAX_ZOOM},
              minZoom: ${MIN_ZOOM},
            }).addTo(map);

            window.updateMapPosition = function(lat, lng) {
              loggerInstance.log('Map position updated to: ' + lat + ', ' + lng);
              map.setView([lat, lng], map.getZoom());
            };
            window.updateMapZoom = function(zoom) {
              loggerInstance.log('Zoom level changed to: ' + zoom);
              map.setZoom(zoom);
            };
            window.updateMapPosition(${latitude}, ${longitude});
            window.updateMapZoom(${zoom});
            
            window.updateBins = function(bins) {
              loggerInstance.log('Bins updated: ' + JSON.stringify(bins));

              binMarkers.forEach(marker => {
                map.removeLayer(marker);
              });
              binMarkers = [];

              bins.forEach(bin => {
                var marker = L.marker([bin.latitude, bin.longitude]).addTo(map);
                marker.bindPopup('Bin ID: ' + bin.id);
                binMarkers.push(marker);
              });
            }
              
            window.ReactNativeWebView.postMessage('Ala ma kota');
          </script>
        </body>
      </html>
    `,
    []
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: leafletHtml }}
        style={styles.webview}
        javaScriptEnabled
        ref={mapViewRef}
        onMessage={(event) => {
          console.log("event in WebView: ", event.nativeEvent.data);
        }}
      />
      <Image
        source={require("@/assets/images/arrow.png")}
        style={{ ...styles.arrow, transform: [{ rotate: `${rotation}deg` }] }}
      />
      <View style={styles.binList}>
        <Text>Total bins in area: {bins.data?.length ?? 0}</Text>
        {bins.data?.map((bin: { id: number }) => (
          <View key={bin.id}>
            <Text>Bin ID: {bin.id}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webview: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f00",
    borderStyle: "solid",
    transformOrigin: "center center",
    transform: [{ scale: 2 }],
  },
  arrow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 30,
    height: 30,
    transform: [{ translateX: -15 }, { translateY: -15 }, { rotate: "45deg" }],
    zIndex: 1,
  },
  binList: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "white",
    fontSize: 9,
    padding: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    zIndex: 2,
  },
});

export default LeafletMap;
