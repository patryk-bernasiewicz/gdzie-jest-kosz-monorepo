import { useCallback, useEffect, useState } from 'react';
import { Bin } from '../Bin';
import { useUpdateBinLocation } from './useUpdateBinLocation';
import { Position } from '../types/Position';

const OFFSET_VALUE = 0.000005;

type UseEditBinResult = {
  editedBin: Bin | null;
  isBinLocationUpdating: boolean;
  handleEditBin: (bin: Bin) => void;
  handleConfirmEditBin: () => void;
  handleCancelEditBin: () => void;
  updatedBinPosition: Position;
  handleUpdateBinPosition: (position: Position) => void;
};

const useEditBin = (): UseEditBinResult => {
  const [editedBin, setEditedBin] = useState<Bin | null>(null);
  const { mutate: updateBinLocation, isPending: isBinLocationUpdating } =
    useUpdateBinLocation();
  const [updatedBinPosition, setUpdatedBinPosition] = useState<Position>([
    0, 0,
  ]);

  const handleEditBin = useCallback((bin: Bin) => {
    setEditedBin(bin);
    setUpdatedBinPosition([Number(bin.latitude), Number(bin.longitude)]);
  }, []);

  const handleConfirmEditBin = useCallback(() => {
    if (!editedBin) {
      return;
    }
    updateBinLocation({
      binId: editedBin.id,
      latitude: updatedBinPosition[0],
      longitude: updatedBinPosition[1],
    });
    setEditedBin(null);
  }, [editedBin, updateBinLocation, updatedBinPosition]);

  const handleCancelEditBin = useCallback(() => {
    setEditedBin(null);
  }, []);

  useEffect(() => {
    if (!editedBin) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        if (window.confirm('Are you sure you want to cancel?')) {
          handleCancelEditBin();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (window.confirm('Are you sure you want to confirm?')) {
          handleConfirmEditBin();
        }
        return;
      }
      let lat = updatedBinPosition[0];
      let lng = updatedBinPosition[1];
      if (event.key === 'ArrowUp') {
        lat += OFFSET_VALUE;
      } else if (event.key === 'ArrowDown') {
        lat -= OFFSET_VALUE;
      } else if (event.key === 'ArrowLeft') {
        lng -= OFFSET_VALUE;
      } else if (event.key === 'ArrowRight') {
        lng += OFFSET_VALUE;
      } else {
        return;
      }
      setUpdatedBinPosition([lat, lng]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    editedBin,
    handleCancelEditBin,
    handleConfirmEditBin,
    updatedBinPosition,
  ]);

  const handleUpdateBinPosition = useCallback((position: Position) => {
    setUpdatedBinPosition(position);
  }, []);

  return {
    editedBin,
    isBinLocationUpdating,
    handleEditBin,
    handleConfirmEditBin,
    handleCancelEditBin,
    updatedBinPosition,
    handleUpdateBinPosition,
  };
};

export default useEditBin;
