import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Bin } from "../../Bin";
import { Marker } from "react-leaflet";

const offsetValue = 0.000005;

const editedBinIcon = new L.Icon({
  iconUrl: "/bin-icon.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: "hue-rotate-180 drop-shadow-[0_0_8px_theme(colors.blue.500)]",
});

type EditedBinMarkerProps = {
  editedBinId: number | null;
  bins: Bin[];
  onConfirm?: (updatedLatLng: [number, number]) => void;
  onCancel?: () => void;
};

type OffsetType = [number, number] | null;

const EditedBinMarker = ({
  editedBinId,
  bins,
  onConfirm,
  onCancel,
}: EditedBinMarkerProps) => {
  const [editedBinLocationOffset, setEditedBinLocationOffset] =
    useState<OffsetType>(null);
  const editedBinLocation = useMemo<[number, number]>(() => {
    if (editedBinId) {
      const bin = bins.find((b) => b.id === editedBinId);
      if (bin) {
        const latitude =
          parseFloat(bin.latitude) + Number(editedBinLocationOffset?.[0] || 0);
        const longitude =
          parseFloat(bin.longitude) + Number(editedBinLocationOffset?.[1] || 0);
        console.log("===============", {
          latitude,
          bin,
          "editedBinLocationOffset[0]": editedBinLocationOffset?.[0],
        });
        return [Number(latitude), Number(longitude)];
      }
    }
    return [0, 0] as [number, number];
  }, [editedBinId, bins, editedBinLocationOffset]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editedBinId) {
        console.log("event", event.key);
        if (event.key === "Escape") {
          if (onCancel && window.confirm("Are you sure you want to cancel?"))
            onCancel();
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          if (onConfirm && window.confirm("Are you sure you want to confirm?"))
            onConfirm([
              Number(editedBinLocation[0]),
              Number(editedBinLocation[1]),
            ]);
          return;
        }
        const offset = [0, 0];
        if (event.key === "ArrowUp") {
          offset[0] += offsetValue;
        } else if (event.key === "ArrowDown") {
          offset[0] -= offsetValue;
        } else if (event.key === "ArrowLeft") {
          offset[1] -= offsetValue;
        } else if (event.key === "ArrowRight") {
          offset[1] += offsetValue;
        } else {
          return;
        }
        setEditedBinLocationOffset((prev) => [
          Number(prev?.[0] || 0) + offset[0],
          Number(prev?.[1] || 0) + offset[1],
        ]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editedBinId, editedBinLocationOffset, onConfirm, onCancel]);

  console.log("editedBinLocation", editedBinLocation);

  return <Marker position={editedBinLocation} icon={editedBinIcon} />;
};

export default EditedBinMarker;
