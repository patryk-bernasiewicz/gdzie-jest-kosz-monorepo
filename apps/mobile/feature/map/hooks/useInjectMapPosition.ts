import { RefObject, useEffect } from 'react';
import WebView from 'react-native-webview';

/**
 * A custom hook that injects JavaScript into a WebView when the user's location is updated
 * @param mapViewRef - reference to the WebView component
 * @param latitude - latitude for the map center
 * @param longitude - longitude for the map center
 * @return {void}
 */
export default function useInjectMapPosition(
  mapViewRef: RefObject<WebView | null>,
  latitude?: number | null,
  longitude?: number | null
): void {
  useEffect(() => {
    if (!mapViewRef.current || !latitude || !longitude) {
      return;
    }

    const injectedJs = /*js*/ `
      if (window.updateMapPosition) {
        window.updateMapPosition(${latitude}, ${longitude});
      }
    `;

    mapViewRef.current.injectJavaScript(injectedJs);
  }, [latitude, longitude, mapViewRef]);
}
