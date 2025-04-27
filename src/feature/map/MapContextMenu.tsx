import { Menu, Item, MenuProps } from "react-contexify";

type MapContextMenuProps = {
  contextMenuMarker: [number, number] | null;
  onAddBin: (lat: number, lng: number) => void;
  menuId: string;
  onVisibilityChange?: MenuProps["onVisibilityChange"];
};

const MapContextMenu = ({
  contextMenuMarker,
  onAddBin,
  menuId,
  onVisibilityChange,
}: MapContextMenuProps) => (
  <Menu
    id={menuId}
    animation="fade"
    className="translate-x-[4px] translate-y-[4px]"
    onVisibilityChange={onVisibilityChange}
  >
    <Item
      onClick={() => {
        if (contextMenuMarker) {
          onAddBin(contextMenuMarker[0], contextMenuMarker[1]);
        } else {
          console.error("No contextMenuMarker set when trying to add bin");
        }
      }}
    >
      Add bin here
    </Item>
    <Item onClick={() => alert("Another action")}>Another action</Item>
  </Menu>
);

export default MapContextMenu;
