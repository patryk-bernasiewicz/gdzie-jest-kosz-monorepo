import { useSearchParams } from "react-router-dom";
import { useLatLngSearchParamsInitializer } from "./hooks/useLatLngSearchParamsInitializer";
import MapComponent from "../../components/MapComponent/MapComponent";
import { useBins } from "./hooks/useBins";
import { useState, useCallback } from "react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { setSearchParamsWithLatLng } from "./utils/setSearchParamsWithLatLng";
import ContextMenuMarker from "./ContextMenuMarker";
import BinsMarkers from "./components/BinsMarkers/BinsMarkers";
import { useCreateBin } from "./hooks/useCreateBin";
import MapContextMenu from "./MapContextMenu";
import BinContextMenu from "./BinContextMenu";
import EditedBinMarker from "./components/EditedBinMarker/EditedBinMarker";
import { useUpdateBinLocation } from "./hooks/useUpdateBinLocation";
import { cn } from "../../utils/cn";

// ‼️ TODO: refactor heavily!!! this is a mess now

const MAP_CONTEXT_MENU_ID = "map-context-menu";
const BIN_CONTEXT_MENU_ID = "bin-context-menu";

const MapPage = () => {
  const { latitude, longitude } = useLatLngSearchParamsInitializer();
  const bins = useBins(latitude, longitude);
  const [contextMenuMarker, setContextMenuMarker] = useState<
    [number, number] | null
  >(null);
  const [, setSearchParams] = useSearchParams();
  const createBin = useCreateBin();
  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);
  const [editedBinId, setEditedBinId] = useState<number | null>(null);
  const { show } = useContextMenu({ id: MAP_CONTEXT_MENU_ID });
  const { mutate: updateBinLocation, isPending: isBinLocationUpdating } =
    useUpdateBinLocation();

  const handleCenterChange = useCallback(
    (lat: number, lng: number) => {
      setSearchParamsWithLatLng(setSearchParams, lat, lng);
    },
    [setSearchParams]
  );

  const handleContextMenu = useCallback(
    (lat: number, lng: number, event: MouseEvent) => {
      setContextMenuMarker([lat, lng]);
      show({ id: MAP_CONTEXT_MENU_ID, event });
    },
    [show]
  );

  const handleBinContextMenu = (binId: number, event: MouseEvent) => {
    console.log("event", event);
    setSelectedBinId(binId);
  };

  const handleDeleteBin = (binId: number) => {
    // TODO: Implement delete logic

    console.log("Delete bin", binId);
  };

  const handleEditBin = (binId: number) => {
    setEditedBinId(binId);
    setSelectedBinId(null);
  };

  const handleBinContextMenuChange = (visible: boolean) => {
    if (!visible) {
      setSelectedBinId(null);
    }
  };

  const handleMapContextMenuChange = (visible: boolean) => {
    if (!visible) {
      setContextMenuMarker(null);
    }
  };

  const handleConfirmEditBin = (updatedLatLng: [number, number]) => {
    if (editedBinId) {
      updateBinLocation({
        binId: editedBinId,
        latitude: updatedLatLng[0],
        longitude: updatedLatLng[1],
      });
      setEditedBinId(null);
    }
  };

  const handleCancelEditBin = () => {
    if (editedBinId) {
      const foundBin = bins.find((b) => b.id === editedBinId);
      console.log("Cancel edit bin", {
        editedBinId,
        originalPos: [foundBin?.latitude, foundBin?.longitude],
      });
      setEditedBinId(null);
    }
  };

  if (!latitude || !longitude) {
    return <div>Latitude and longitude are required.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="font-semibold">Bins</div>
      <div>
        {editedBinId && (
          <div>
            Use <strong>arrow keys</strong> to move the bin around the map.
            Press <strong>ctrl + enter</strong> to apply, or press{" "}
            <strong>esc</strong> to cancel.
          </div>
        )}
      </div>
      <div
        className={cn(
          "border border-red-500 p-2",
          isBinLocationUpdating && "opacity-50 pointer-events-none"
        )}
      >
        <MapComponent
          latitude={latitude}
          longitude={longitude}
          onCenterChange={handleCenterChange}
          onContextMenu={handleContextMenu}
        >
          {contextMenuMarker?.[0] && contextMenuMarker?.[1] && (
            <ContextMenuMarker
              position={contextMenuMarker}
              onClick={() => {
                console.log("Context menu marker clicked:", contextMenuMarker);
              }}
            />
          )}
          <BinsMarkers
            bins={bins}
            onBinContextMenu={handleBinContextMenu}
            selectedBinId={selectedBinId}
            editedBinId={editedBinId}
          />
          {editedBinId && (
            <EditedBinMarker
              bins={bins}
              editedBinId={editedBinId}
              onCancel={handleCancelEditBin}
              onConfirm={handleConfirmEditBin}
            />
          )}
        </MapComponent>
        <MapContextMenu
          contextMenuMarker={contextMenuMarker}
          onAddBin={(lat, lng) => {
            createBin.mutate({ latitude: lat, longitude: lng });
          }}
          menuId={MAP_CONTEXT_MENU_ID}
          onVisibilityChange={handleMapContextMenuChange}
        />
        {selectedBinId && (
          <BinContextMenu
            binId={selectedBinId}
            menuId={BIN_CONTEXT_MENU_ID}
            onDelete={handleDeleteBin}
            onEdit={handleEditBin}
            onVisibilityChange={handleBinContextMenuChange}
          />
        )}
      </div>
      <pre>{JSON.stringify({ selectedBinId, editedBinId })}</pre>
    </div>
  );
};

export default MapPage;
