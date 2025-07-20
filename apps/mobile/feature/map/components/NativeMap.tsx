import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import TokenDebug from '@/feature/auth/components/debug/TokenDebug';
import useBins from '@/feature/bins/hooks/useBins';
import useBinsWithDistance from '@/feature/bins/hooks/useBinsWithDistance';
import useCreateBin from '@/feature/bins/hooks/useCreateBin';
import useMarkInvalidBin from '@/feature/bins/hooks/useMarkInvalidBin';
import useNearestBin from '@/feature/bins/hooks/useNearestBin';
import { Bin } from '@/feature/bins/types';
import DebugOnly from '@/ui/components/debug/DebugOnly';
import { useColorScheme } from '@/ui/hooks/useColorScheme';

import MapContextMenu from './MapContextMenu';
import NearestBinInformation from './NearestBinInformation';
import BinsList from './debug/BinsList';
import DebugUserLocation from './debug/DebugUserLocation';
import OffsetControls from './debug/OffsetControls';

type NativeMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number;
};

export default function NativeMap({
  latitude,
  longitude,
  zoom = 15,
}: NativeMapProps) {
  // All hooks must be declared at the top level to maintain order
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  const colorScheme = useColorScheme();

  // Dynamic tile URL based on theme - OpenFreeMap (MIT license, commercial friendly)
  const tileUrl =
    colorScheme === 'dark'
      ? 'https://tiles.openfreemap.org/styles/dark/{z}/{x}/{y}.png'
      : 'https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png';

  const bins = useBins();
  const binsWithDistance = useBinsWithDistance(bins.data);
  const { nearestBin, nearestBinDirection } = useNearestBin(binsWithDistance);

  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [mapSelectedBins, setMapSelectedBins] = useState<Bin['id'][]>([]);

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

  // Clear context menu when bins are created or marked invalid
  const clearContextMenu = useCallback(() => {
    setContextMenuPos(null);
    setSelectedPos(null);
    setMapSelectedBins([]);
  }, []);

  React.useEffect(() => {
    if (isBinCreated || isBinMarkedInvalid) {
      clearContextMenu();
    }
  }, [isBinCreated, isBinMarkedInvalid, clearContextMenu]);

  const handleCreateBin = () => {
    if (isCreatingBin || !selectedPos) {
      return;
    }
    mutateCreateBin(selectedPos);
  };

  const handleConfirmInvalidBin = useCallback(
    (binId: number) => {
      if (isMarkingBinInvalid) {
        return;
      }
      markInvalidBin(binId);
    },
    [isMarkingBinInvalid, markInvalidBin],
  );

  const handleMarkInvalidBin = useCallback(
    (binId: number) => {
      Alert.alert(
        'Potwierdź akcję',
        `Czy chcesz oznaczyć kosz ID: ${binId} jako nieaktualny?`,
        [
          {
            text: 'Tak',
            onPress: () => handleConfirmInvalidBin(binId),
          },
          {
            text: 'Nie',
            style: 'cancel',
          },
        ],
      );
    },
    [handleConfirmInvalidBin],
  );

  const handleLongPress = useCallback((event: any) => {
    console.log('Map long press detected');
    const { coordinate, position } = event.nativeEvent;
    setSelectedPos([coordinate.latitude, coordinate.longitude]);
    setContextMenuPos({ x: position.x, y: position.y });
    setMapSelectedBins([]);

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleBinLongPress = useCallback(
    (binId: number) => (event: any) => {
      console.log('Bin long press detected for bin:', binId);
      const { coordinate, position } = event.nativeEvent;
      setSelectedPos([coordinate.latitude, coordinate.longitude]);
      setContextMenuPos({ x: position.x, y: position.y });
      setMapSelectedBins([binId]);

      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [],
  );

  // Handle tap to close context menu (only if not long pressing)
  const handleBackgroundPress = useCallback(() => {
    console.log(
      'Background press detected. isLongPressing:',
      isLongPressing.current,
      'contextMenuPos:',
      !!contextMenuPos,
    );
    if (!isLongPressing.current && contextMenuPos) {
      console.log('Closing context menu');
      setContextMenuPos(null);
    }
  }, [contextMenuPos]);

  const handlePressIn = useCallback(() => {
    console.log('Press in detected');
    isLongPressing.current = false;
    // Start timer to detect long press
    longPressTimer.current = setTimeout(() => {
      console.log('Long press threshold reached');
      isLongPressing.current = true;
    }, 500); // 500ms threshold for long press
  }, []);

  const handlePressOut = useCallback(() => {
    console.log('Press out detected');
    // Clear the timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Reset long press flag after a short delay
    setTimeout(() => {
      console.log('Resetting long press flag');
      isLongPressing.current = false;
    }, 100);
  }, []);

  if (!latitude || !longitude) {
    return (
      <>
        <Text>Map is not available</Text>
        <DebugOnly>
          <Text>latitude: {latitude}</Text>
          <Text>longitude: {longitude}</Text>
        </DebugOnly>
      </>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={handleBackgroundPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.002, // Maximum zoom level (smaller delta = more zoomed in)
            longitudeDelta: 0.002,
          }}
          onLongPress={handleLongPress}
          showsUserLocation={true}
          followsUserLocation={true}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          mapType={Platform.OS === 'android' ? 'none' : 'mutedStandard'}
        >
          <UrlTile
            urlTemplate={tileUrl}
            shouldReplaceMapContent={Platform.OS === 'android'}
            maximumZ={19}
            flipY={false}
          />
          {binsWithDistance?.map((bin) => {
            const isNearest = nearestBin?.id === bin.id;
            return (
              <Marker
                key={bin.id}
                coordinate={{
                  latitude: bin.latitude,
                  longitude: bin.longitude,
                }}
                onLongPress={handleBinLongPress(bin.id)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: isNearest ? '#ff0000' : '#00ff00' },
                  ]}
                />
              </Marker>
            );
          })}
        </MapView>

        <MapContextMenu
          screenX={contextMenuPos?.x}
          screenY={contextMenuPos?.y}
          isOpen={!!contextMenuPos}
          onCreateBin={handleCreateBin}
          disabled={isCreatingBin || isMarkingBinInvalid || !selectedPos}
          selectedBinIds={mapSelectedBins}
          onMarkInvalidBin={handleMarkInvalidBin}
        />

        <NearestBinInformation
          nearestBin={nearestBin}
          direction={nearestBinDirection}
        />

        <DebugOnly>
          <BinsList bins={binsWithDistance} />
          <OffsetControls />
          <DebugUserLocation />
          <TokenDebug />
        </DebugOnly>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});
