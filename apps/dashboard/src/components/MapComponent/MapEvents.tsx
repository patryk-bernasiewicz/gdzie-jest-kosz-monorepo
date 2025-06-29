import { useMapEvents } from 'react-leaflet';
import type { LeafletEvent, Map as LeafletMap } from 'leaflet';

type MapEventsProps = {
  onCenterChange?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
  onContextMenu?: (lat: number, lng: number, event: MouseEvent) => void;
};

const MapEvents = ({
  onCenterChange,
  onZoomChange,
  onContextMenu,
}: MapEventsProps) => {
  useMapEvents({
    moveend: (e: LeafletEvent) => {
      const map = e.target as LeafletMap;
      const center = map.getCenter();
      if (onCenterChange) {
        onCenterChange(center.lat, center.lng);
      }
    },
    zoomend: (e: LeafletEvent) => {
      const map = e.target as LeafletMap;
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    },
    contextmenu: (e) => {
      if (onContextMenu) {
        onContextMenu(e.latlng.lat, e.latlng.lng, e.originalEvent);
      }
    },
  });
  return null;
};

export default MapEvents;
