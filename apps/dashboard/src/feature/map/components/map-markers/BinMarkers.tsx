import { Marker } from 'react-leaflet';
import { useContextMenu } from 'react-contexify';
import { Bin } from '../../Bin';
import L from 'leaflet';

const BIN_CONTEXT_MENU_ID = 'bin-context-menu';

const binIcon = L.icon({
  iconUrl: '/bin-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const unacceptedBinIcon = L.icon({
  iconUrl: '/bin-unaccepted-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const selectedBinIcon = L.icon({
  iconUrl: '/bin-icon.svg',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  className: 'hue-rotate-90 drop-shadow-[0_0_8px_theme(colors.green.500)]',
});

const selectedHiddenBinIcon = L.icon({
  iconUrl: '/bin-hidden-icon.svg',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  className: 'hue-rotate-90 drop-shadow-[0_0_8px_theme(colors.green.500)]',
});

const editedBinIcon = L.icon({
  iconUrl: '/bin-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const hiddenBinIcon = L.icon({
  iconUrl: '/bin-hidden-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type BinsMarkersProps = {
  bins: Bin[];
  onBinContextMenu: (binId: number, event: MouseEvent) => void;
  selectedBin?: Bin | null;
  editedBin?: Bin | null;
};

const BinsMarkers = ({
  bins,
  editedBin,
  selectedBin,
  onBinContextMenu,
}: BinsMarkersProps) => {
  const { show } = useContextMenu({ id: BIN_CONTEXT_MENU_ID });

  return (
    <>
      {bins.map((bin) => {
        const isEdited = editedBin && editedBin === bin;
        const isSelected = selectedBin && selectedBin === bin;
        const isHidden = bin.visibility === false;
        const isUnaccepted = bin.acceptedAt === null;

        let icon = binIcon;

        if (isEdited) {
          icon = editedBinIcon;
        } else if (isSelected) {
          if (isHidden) {
            icon = selectedHiddenBinIcon;
          } else {
            icon = selectedBinIcon;
          }
        } else if (isHidden) {
          icon = hiddenBinIcon;
        } else if (isUnaccepted) {
          icon = unacceptedBinIcon;
        }

        return (
          <Marker
            key={bin.id}
            position={[Number(bin.latitude), Number(bin.longitude)]}
            icon={icon}
            eventHandlers={{
              contextmenu: (e) => {
                e.originalEvent.stopPropagation();
                onBinContextMenu(bin.id, e.originalEvent);
                show({ id: BIN_CONTEXT_MENU_ID, event: e.originalEvent });
              },
            }}
            opacity={bin.acceptedAt ? 1 : 0.5}
          />
        );
      })}
    </>
  );
};

export default BinsMarkers;
