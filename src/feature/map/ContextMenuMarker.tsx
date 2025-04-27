import { Marker } from "react-leaflet";
import { DivIcon } from "leaflet";

type ContextMenuMarkerProps = {
  position: [number, number];
  onClick: () => void;
};

const ContextMenuMarker = ({ position, onClick }: ContextMenuMarkerProps) => (
  <Marker
    icon={
      new DivIcon({
        className: "w-2 h-2 bg-red-500 rounded-full opacity-50",
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })
    }
    position={position}
    eventHandlers={{ click: onClick }}
  />
);

export default ContextMenuMarker;
