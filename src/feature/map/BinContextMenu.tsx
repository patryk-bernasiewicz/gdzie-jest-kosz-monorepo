import { Menu, Item, MenuProps } from "react-contexify";

type BinContextMenuProps = {
  binId: number;
  menuId: string;
  onDelete: (binId: number) => void;
  onEdit?: (binId: number) => void;
  onVisibilityChange?: MenuProps["onVisibilityChange"];
};

const BinContextMenu = ({
  binId,
  menuId,
  onDelete,
  onEdit,
  onVisibilityChange,
}: BinContextMenuProps) => (
  <Menu
    id={menuId}
    animation="fade"
    className="translate-x-[4px] translate-y-[4px]"
    onVisibilityChange={onVisibilityChange}
  >
    <Item onClick={() => onEdit?.(binId)}>Edit bin</Item>
    <Item onClick={() => onDelete(binId)}>Delete bin</Item>
  </Menu>
);

export default BinContextMenu;
