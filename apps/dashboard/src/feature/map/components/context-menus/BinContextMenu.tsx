import { Menu, Item, MenuProps } from "react-contexify";
import { Bin } from "../../Bin";

type BinContextMenuProps = {
  bins: Bin[];
  selectedBin: Bin;
  menuId: string;
  onDelete?: (bin: Bin) => void;
  onEdit?: (bin: Bin) => void;
  onVisibilityChange?: MenuProps["onVisibilityChange"];
};

const BinContextMenu = ({
  selectedBin,
  menuId,
  onDelete,
  onEdit,
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
    </Menu>
  );
};

export default BinContextMenu;
