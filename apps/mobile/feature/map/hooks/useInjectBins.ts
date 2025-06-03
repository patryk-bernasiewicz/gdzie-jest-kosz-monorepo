import { RefObject, useEffect, useMemo, useRef } from 'react';
import WebView from 'react-native-webview';

import useBins from '@/feature/bins/hooks/useBins';
// No longer need useBinsWithDistance here if it only needs raw bin data
// import useBinsWithDistance from '@/feature/bins/hooks/useBinsWithDistance';
import { Bin } from '@/feature/bins/types'; // Assuming Bin type is available

// TODO: Define or import the correct type for BinWithDistance if available
// For now, using a generic structure or 'any' if structure is unknown
interface BinWithDistance {
  id: number | string; // Assuming id is present
  distance: number | null;
  [key: string]: any; // Allow other properties
}

/**
 * Custom hook that injects JavaScript into a WebView when the bins data is updated
 * @param mapViewRef - reference to the WebView component
 * @param isHtmlReady - boolean indicating whether the HTML is ready
 * @return {void}
 */
export default function useInjectBins(
  mapViewRef: RefObject<WebView | null>,
  isHtmlReady?: boolean | null
): void {
  const { data: binsData, isLoading: isLoadingBins, error: binsError } = useBins();

  const previousBinsSnapshotRef = useRef<string | null | undefined>(undefined);

  const binsSnapshot = useMemo(() => {
    if (!binsData) {
      previousBinsSnapshotRef.current = null;
      return null;
    }
    const currentSnapshotString = JSON.stringify(Array.isArray(binsData) ? binsData : []);

    // Minimal logging for actual changes, can be removed if too verbose in production
    if (
      previousBinsSnapshotRef.current !== undefined &&
      previousBinsSnapshotRef.current !== currentSnapshotString
    ) {
      console.log('[useInjectBins] Detected change in raw bins data, preparing to update WebView.');
    }

    previousBinsSnapshotRef.current = currentSnapshotString;
    return currentSnapshotString;
  }, [binsData]);

  useEffect(() => {
    if (isLoadingBins || binsError) {
      return;
    }

    if (!mapViewRef.current || !isHtmlReady || !binsSnapshot) {
      return;
    }

    const injectedJs = /*js*/ `
      if (window.updateBins) {
        window.updateBins(${binsSnapshot});
      }
    `;

    mapViewRef.current.injectJavaScript(injectedJs);
  }, [binsSnapshot, isHtmlReady, mapViewRef, isLoadingBins, binsError]);
}
