import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../../utils/cn";
import MapEvents from "./MapEvents";

type MapComponentProps = {
  latitude: number;
  longitude: number;
  className?: string;
  onCenterChange?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
  onContextMenu?: (lat: number, lng: number, event: MouseEvent) => void;
  children?: React.ReactNode;
};

const MapComponent = ({
  latitude,
  longitude,
  className,
  onCenterChange,
  onZoomChange,
  onContextMenu,
  children,
}: MapComponentProps) => {
  return (
    <MapContainer
      // weird bug with leaflet, center is not recognized as a prop
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      center={[latitude, longitude]}
      zoom={19}
      className={cn("h-full min-h-[400px] w-full rounded-lg shadow", className)}
      scrollWheelZoom={true}
    >
      <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
      <MapEvents
        onCenterChange={onCenterChange}
        onZoomChange={onZoomChange}
        onContextMenu={onContextMenu}
      />
      {children}
    </MapContainer>
  );
};

export default MapComponent;
