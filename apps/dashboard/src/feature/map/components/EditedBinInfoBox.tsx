import Button from '../../../components/Button';

type EditedBinInfoBoxProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const EditedBinInfoBox = ({ onCancel, onConfirm }: EditedBinInfoBoxProps) => {
  return (
    <div className="flex flex-col gap-4 rounded border border-blue-400 bg-blue-50 p-4 text-sm">
      <div>
        Use <strong>arrow keys</strong> to move the bin around the map. Press{' '}
        <strong>ctrl + enter</strong> to apply, or press <strong>esc</strong> to
        cancel.
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="button" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default EditedBinInfoBox;
