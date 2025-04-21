import useBins from "@/hooks/useBins";
import useBinsWithDistance from "@/hooks/useBinsWithDistance";
import createLeafletHtml from "@/lib/createLeafletHtml";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable, Alert } from "react-native";
import { WebView } from "react-native-webview";
import BinsList from "./debug/BinsList";
import useCreateBin from "@/hooks/useCreateBin";
import OffsetControls from "./debug/OffsetControls";
import useNearestBin from "@/hooks/useNearestBin";
import NearestBinInformation from "./NearestBinInformation";
import { Bin } from "@/types/Bin";
import MapContextMenu from "./MapContextMenu";
import useMarkInvalidBin from "@/hooks/useMarkInvalidBin";

type LeafletMapProps = {
  latitude?: number;
  longitude?: number;
  zoom?: number;
};

const logsDisabled = false;

function LeafletMap({ latitude, longitude, zoom = 13 }: LeafletMapProps) {
  const mapViewRef = useRef<WebView>(null);
  const bins = useBins();

  const binsWithDistance = useBinsWithDistance(bins.data);
  const { nearestBin, nearestBinDirection } = useNearestBin(binsWithDistance);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const {
    mutate: mutateCreateBin,
    isPending: isCreatingBin,
    isSuccess: isBinCreated,
  } = useCreateBin();
  const {
    mutate: markInvalidBin,
    isPending: isMarkingBinInvalid,
    isSuccess: isBinMarkedInvalid,
  } = useMarkInvalidBin();

  const leafletHtml = useRef<string>();
  const [htmlReady, setHtmlReady] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [mapSelectedBins, setMapSelectedBins] = useState<Bin["id"][]>([]);

  const logWebViewMessage = (...messages: any[]) => {
    if (!logsDisabled) {
      console.log("WebView message: ", ...messages);
    }
  };

  const handleCreateBin = () => {
    if (isCreatingBin || !selectedPos) return;
    mutateCreateBin(selectedPos);
  };

  const handleConfirmInvalidBin = (binId: number) => {
    if (isMarkingBinInvalid) return;
    markInvalidBin(binId);
  };

  const handleMarkInvalidBin = (binId: number) => {
    console.log(`bin id ${binId} marked as invalid`);
    Alert.alert(
      "Potwierdź akcję",
      `Czy chcesz oznaczyć kosz ID: ${binId} jako nieaktualny?`,
      [
        {
          text: "Tak",
          onPress: () => handleConfirmInvalidBin(binId),
        },
        {
          text: "Nie",
          style: "cancel",
        },
      ]
    );
  };

  useEffect(() => {
    if (isBinCreated) {
      setContextMenuPos(null);
      setSelectedPos(null);
      setMapSelectedBins([]);

      if (mapViewRef.current) {
        const injectedJs = /*js*/ `
          if (window.clearSelectedPos) {
            window.clearSelectedPos();
          }
        `;

        mapViewRef.current.injectJavaScript(injectedJs);
      }
    }
  }, [isBinCreated]);

  useEffect(() => {
    if (isBinMarkedInvalid) {
      setContextMenuPos(null);
      setSelectedPos(null);
      setMapSelectedBins([]);

      if (mapViewRef.current) {
        const injectedJs = /*js*/ `
          if (window.clearSelectedPos) {
            window.clearSelectedPos();
          }
        `;

        mapViewRef.current.injectJavaScript(injectedJs);
      }
    }
  }, [isBinMarkedInvalid]);

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
          window.updateBins(${JSON.stringify(binsWithDistance)});
        }
      `;

      mapViewRef.current.injectJavaScript(injectedJs);
    }
  }, [mapLoaded, binsWithDistance]);

  useEffect(() => {
    if (mapLoaded && nearestBin && mapViewRef.current) {
      const injectedJs = /*js*/ `
        if (window.markClosestBin) {
          window.markClosestBin(${nearestBin.id});
        }
      `;
      mapViewRef.current.injectJavaScript(injectedJs);
    }
  }, [mapLoaded, nearestBin]);

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
                  logWebViewMessage("event in WebView: ", data.message);
                } else if (data.type === "contextmenu") {
                  setContextMenuPos(data.screenPos);
                  setSelectedPos([data.latlng.lat, data.latlng.lng]);
                  if (data.selectedBins) {
                    setMapSelectedBins(data.selectedBins);
                  }
                }
                logWebViewMessage("event in WebView: ", data);
              } catch (error) {
                console.error("Failed to parse WebView message:", error);
              }
            }}
            webviewDebuggingEnabled
          />
        )}
        <MapContextMenu
          screenX={contextMenuPos?.x}
          screenY={contextMenuPos?.y}
          isOpen={!!contextMenuPos}
          onCreateBin={handleCreateBin}
          disabled={isCreatingBin || !selectedPos}
          selectedBinIds={mapSelectedBins}
          onMarkInvalidBin={handleMarkInvalidBin}
        />
        <BinsList bins={binsWithDistance} />
        <OffsetControls />
        <NearestBinInformation
          nearestBin={nearestBin}
          direction={nearestBinDirection}
        />
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
