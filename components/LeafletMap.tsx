import useBins from "@/hooks/useBins";
import createLeafletHtml from "@/lib/createLeafletHtml";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { WebView } from "react-native-webview";

type LeafletMapProps = {
  latitude?: number;
  longitude?: number;
  zoom?: number;
};

function LeafletMap({ latitude, longitude, zoom = 13 }: LeafletMapProps) {
  const mapViewRef = useRef<WebView>(null);
  const bins = useBins();
  const [mapLoaded, setMapLoaded] = useState(false);

  const leafletHtml = useRef<string>();
  const [htmlReady, setHtmlReady] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // TODO: it's a mess, need to REFACTOR THE HELL OUT OF IT

  useEffect(() => {
    if (mapViewRef.current) {
      const injectedJs = /*js*/ `
        if (window.updateMapPosition) {
          window.updateMapPosition(${latitude}, ${longitude});
        }
      `;

      mapViewRef.current.injectJavaScript(injectedJs);
    }

    if (latitude && longitude && !leafletHtml.current) {
      leafletHtml.current = createLeafletHtml(latitude, longitude);
      setHtmlReady(true);
    }
  }, [setHtmlReady, latitude, longitude]);

  useEffect(() => {
    if (mapLoaded && mapViewRef.current) {
      const injectedJs = /*js*/ `
        if (window.updateBins) {
          window.updateBins(${JSON.stringify(bins.data)});
        }
      `;

      mapViewRef.current.injectJavaScript(injectedJs);
    }
  }, [mapLoaded, bins.data]);

  return (
    <Pressable onPress={() => setContextMenuPos(null)} style={styles.container}>
      <View style={styles.container}>
        {!htmlReady ? (
          <Text>Loading map...</Text>
        ) : (
          <WebView
            source={{ html: leafletHtml.current as string }}
            style={styles.webview}
            javaScriptEnabled
            ref={mapViewRef}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "maploaded") {
                  setMapLoaded(true);
                } else if (data.type === "log") {
                  console.log("event in WebView: ", data.message);
                } else if (data.type === "contextmenu") {
                  setContextMenuPos(data.screenPos);
                }
                console.log("event in WebView: ", data);
              } catch (error) {
                console.error("Failed to parse WebView message:", error);
              }
            }}
            webviewDebuggingEnabled
          />
        )}
        {contextMenuPos && (
          <>
            <View
              style={{
                position: "absolute",
                top: contextMenuPos.y,
                left: contextMenuPos.x,
                borderRadius: 100,
                width: 15,
                height: 15,
                backgroundColor: "rgba(255, 0, 0, 0.5)",
              }}
            />
            <TouchableWithoutFeedback
              onPress={(event) => {
                event.persist();
              }}
            >
              <View
                style={{
                  ...styles.contextMenu,
                  top: contextMenuPos.y + 30,
                  left: Math.min(
                    Dimensions.get("window").width - 150 - 30,
                    contextMenuPos.x
                  ),
                }}
              >
                <Text>Context menu</Text>
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
        <View style={styles.binList}>
          <Text>Total bins in area: {bins.data?.length ?? 0}</Text>
          {bins.data?.map((bin: { id: number }) => (
            <View key={bin.id}>
              <Text>Bin ID: {bin.id}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
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
  contextMenu: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: 5,
    width: 150,
  },
});

export default LeafletMap;
