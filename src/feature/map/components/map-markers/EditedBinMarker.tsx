import L from "leaflet";
import { Marker } from "react-leaflet";
import { Position } from "../../types/Position";

const editedBinIcon = new L.Icon({
  iconUrl: "/bin-icon.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: "hue-rotate-180 drop-shadow-[0_0_8px_theme(colors.blue.500)]",
});

type EditedBinMarkerProps = {
  updatedPosition: Position;
  onMarkerDragged?: (position: Position) => void;
};

const EditedBinMarker = ({
  updatedPosition,
  onMarkerDragged,
}: EditedBinMarkerProps) => {
  return (
    <Marker
      position={updatedPosition}
      icon={editedBinIcon}
      draggable
      eventHandlers={{
        dragend: onMarkerDragged
          ? (event) => {
              const marker = event.target;
              const { lat, lng } = marker.getLatLng();
              onMarkerDragged([lat, lng]);
            }
          : undefined,
      }}
    />
  );
};

export default EditedBinMarker;
