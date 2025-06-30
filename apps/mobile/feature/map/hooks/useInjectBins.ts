import { RefObject, useEffect, useMemo } from 'react';
import WebView from 'react-native-webview';

import useBins from '@/feature/bins/hooks/useBins';

/**
 * Custom hook that injects JavaScript into a WebView when the bins data is updated
 * @param mapViewRef - reference to the WebView component
 * @param isHtmlReady - boolean indicating whether the HTML is ready
 * @return {void}
 */
export default function useInjectBins(
  mapViewRef: RefObject<WebView | null>,
  isHtmlReady?: boolean | null,
): void {
  const {
    data: binsData,
    isLoading: isLoadingBins,
    error: binsError,
  } = useBins();

  const binsSnapshot = useMemo(() => {
    if (!binsData) {
      return null;
    }
    return JSON.stringify(Array.isArray(binsData) ? binsData : []);
  }, [binsData]);

  useEffect(() => {
    if (isLoadingBins || binsError) {
      return;
    }
    if (!mapViewRef.current || !isHtmlReady) {
      return;
    }
    if (binsSnapshot) {
      const injectedJs = /*js*/ `
        if (window.updateBins) {
          window.updateBins(${binsSnapshot});
        }
      `;
      mapViewRef.current.injectJavaScript(injectedJs);
    }
  }, [binsSnapshot, isHtmlReady, mapViewRef, isLoadingBins, binsError]);
}
