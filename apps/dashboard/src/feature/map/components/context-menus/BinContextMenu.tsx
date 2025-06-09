import { Menu, Item, MenuProps } from "react-contexify";
import { Bin } from "../../Bin";

type BinContextMenuProps = {
  bins: Bin[];
  selectedBin: Bin;
  menuId: string;
  onDelete?: (bin: Bin) => void;
  onEdit?: (bin: Bin) => void;
  onAccept?: (bin: Bin) => void;
  onToggleVisibility?: (bin: Bin) => void;
  onVisibilityChange?: MenuProps["onVisibilityChange"];
};

const BinContextMenu = ({
  selectedBin,
  menuId,
  onDelete,
  onEdit,
  onAccept,
  onToggleVisibility,
  onVisibilityChange,
}: BinContextMenuProps) => {
  return (
    <Menu
      id={menuId}
      animation="fade"
      className="translate-x-[4px] translate-y-[4px]"
      onVisibilityChange={onVisibilityChange}
    >
      <Item onClick={() => onEdit?.(selectedBin)}>Edit bin</Item>
      <Item onClick={() => onDelete?.(selectedBin)}>Delete bin</Item>
      {selectedBin.acceptedAt === null && (
        <Item onClick={() => onAccept?.(selectedBin)}>Accept user bin</Item>
      )}
      <Item onClick={() => onToggleVisibility?.(selectedBin)}>
        {selectedBin.visibility ? "Hide bin" : "Show bin"}
      </Item>
    </Menu>
  );
};

export default BinContextMenu;
