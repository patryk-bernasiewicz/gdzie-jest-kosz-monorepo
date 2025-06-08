import { Bin } from "../Bin";
import AcceptDialog from "../../../components/AcceptDialog";

type AcceptBinDialogProps = {
  open: boolean;
  bin: Bin | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const AcceptBinDialog = ({
  open,
  bin,
  onConfirm,
  onCancel,
}: AcceptBinDialogProps) => {
  if (!open || !bin) return null;
  return (
    <AcceptDialog
      open={open}
      title="Accept user bin?"
      description={`Are you sure you want to accept this user-submitted bin (ID: ${bin.id})?`}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default AcceptBinDialog;
