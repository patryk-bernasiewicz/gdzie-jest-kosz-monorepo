import { useSearchParams } from "react-router-dom";
import { useLatLngSearchParamsInitializer } from "./hooks/useLatLngSearchParamsInitializer";
import MapComponent from "../../components/MapComponent/MapComponent";
import { useBins } from "./hooks/useBins";
import { useState, useCallback } from "react";
import { useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { setSearchParamsWithLatLng } from "./utils/setSearchParamsWithLatLng";
import ContextMenuMarker from "./ContextMenuMarker";
import BinsMarkers from "./components/map-markers/BinMarkers";
import { useCreateBin } from "./hooks/useCreateBin";
import MapContextMenu from "./components/context-menus/MapContextMenu";
import BinContextMenu from "./components/context-menus/BinContextMenu";
import EditedBinMarker from "./components/map-markers/EditedBinMarker";
import { cn } from "../../utils/cn";
import EditedBinInfoBox from "./components/EditedBinInfoBox";
import useEditBin from "./hooks/useEditBin";
import { Bin } from "./Bin";
import { Position } from "./types/Position";
import AcceptBinDialog from "./components/AcceptBinDialog";
import { useAcceptBin } from "./hooks/useAcceptBin";
import { useToggleBinVisibility } from "./hooks/useToggleBinVisibility";

// ‼️ TODO: refactor heavily!!! this is a mess now

const MAP_CONTEXT_MENU_ID = "map-context-menu";
const BIN_CONTEXT_MENU_ID = "bin-context-menu";

const MapPage = () => {
  const { latitude, longitude } = useLatLngSearchParamsInitializer();
  const bins = useBins(latitude, longitude);
  const [contextMenuMarker, setContextMenuMarker] = useState<Position | null>(
    null,
  );
  const [, setSearchParams] = useSearchParams();
  const createBin = useCreateBin();
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const { show } = useContextMenu({ id: MAP_CONTEXT_MENU_ID });
  const {
    editedBin,
    handleEditBin,
    handleConfirmEditBin,
    handleCancelEditBin,
    isBinLocationUpdating,
    updatedBinPosition,
    handleUpdateBinPosition,
  } = useEditBin();

  // Accept bin dialog state
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptingBin, setAcceptingBin] = useState<Bin | null>(null);
  const acceptBinMutation = useAcceptBin();
  const toggleVisibilityMutation = useToggleBinVisibility();

  const handleCenterChange = useCallback(
    (lat: number, lng: number) => {
      setSearchParamsWithLatLng(setSearchParams, lat, lng);
    },
    [setSearchParams],
  );

  const handleContextMenu = useCallback(
    (lat: number, lng: number, event: MouseEvent) => {
      setContextMenuMarker([lat, lng]);
      show({ id: MAP_CONTEXT_MENU_ID, event });
    },
    [show],
  );

  const handleBinContextMenu = (binId: number, event: MouseEvent) => {
    console.log("event", event);
    const bin = bins.find((bin) => bin.id === binId);

    if (!bin) {
      console.error(`Bin with id ${binId} not found`);
      return;
    }

    setSelectedBin(bin);
  };

  const handleDeleteBin = (bin: Bin) => {
    // TODO: Implement delete logic

    console.log("Delete bin", bin.id);
  };

  const handleAcceptBin = (bin: Bin) => {
    setAcceptingBin(bin);
    setAcceptDialogOpen(true);
  };

  const handleConfirmAcceptBin = () => {
    if (!acceptingBin) {
      return;
    }
    void acceptBinMutation.mutateAsync(acceptingBin.id).then(() => {
      setAcceptDialogOpen(false);
      setAcceptingBin(null);
      setSelectedBin(null);
    });
  };

  const handleCancelAcceptBin = () => {
    setAcceptDialogOpen(false);
    setAcceptingBin(null);
  };

  const handleToggleVisibility = (bin: Bin) => {
    void toggleVisibilityMutation
      .mutateAsync({
        binId: bin.id,
        visibility: !bin.visibility,
      })
      .then(() => {
        setSelectedBin(null);
      });
  };

  const handleBinContextMenuChange = (visible: boolean) => {
    if (!visible) {
      setSelectedBin(null);
    }
  };

  const handleMapContextMenuChange = (visible: boolean) => {
    if (!visible) {
      setContextMenuMarker(null);
    }
  };

  if (!latitude || !longitude) {
    return <div>Latitude and longitude are required.</div>;
  }

  return (
    <div className="flex grow flex-col gap-y-2">
      <div className="font-semibold">Bins</div>
      <div>
        {editedBin && (
          <EditedBinInfoBox
            onCancel={handleCancelEditBin}
            onConfirm={handleConfirmEditBin}
          />
        )}
      </div>
      <div
        className={cn(
          "grow",
          isBinLocationUpdating && "pointer-events-none opacity-50",
        )}
      >
        <MapComponent
          latitude={latitude}
          longitude={longitude}
          onCenterChange={handleCenterChange}
          onContextMenu={handleContextMenu}
          className="grow"
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
            editedBin={editedBin}
            onBinContextMenu={handleBinContextMenu}
            selectedBin={selectedBin}
          />
          {editedBin && updatedBinPosition && (
            <EditedBinMarker
              updatedPosition={updatedBinPosition}
              onMarkerDragged={handleUpdateBinPosition}
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
        {selectedBin && (
          <BinContextMenu
            bins={bins}
            selectedBin={selectedBin}
            menuId={BIN_CONTEXT_MENU_ID}
            onDelete={handleDeleteBin}
            onEdit={handleEditBin}
            onAccept={handleAcceptBin}
            onToggleVisibility={handleToggleVisibility}
            onVisibilityChange={handleBinContextMenuChange}
          />
        )}
        <AcceptBinDialog
          open={acceptDialogOpen}
          bin={acceptingBin}
          onConfirm={handleConfirmAcceptBin}
          onCancel={handleCancelAcceptBin}
        />
      </div>
    </div>
  );
};

export default MapPage;
