import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import PersonForm, { PersonFormValue, emptyPersonValue } from "./PersonForm";

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue?: PersonFormValue;
  showImage?: boolean;
  submitting?: boolean;
  onSubmit: (value: PersonFormValue, imageFile: File | null) => void | Promise<void>;
}

export default function PersonFormModal({
  isOpen,
  onClose,
  title,
  initialValue,
  showImage = true,
  submitting = false,
  onSubmit,
}: PersonFormModalProps) {
  const [value, setValue] = useState<PersonFormValue>(initialValue ?? emptyPersonValue());
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Re-seed the form whenever it (re)opens for a different item.
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue ?? emptyPersonValue());
      setImageFile(null);
    }
  }, [isOpen, initialValue]);

  const canSubmit = value.first_name.trim() !== "" && value.last_name.trim() !== "" && !submitting;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>

      <PersonForm
        value={value}
        onChange={setValue}
        showImage={showImage}
        onImageSelect={setImageFile}
        selectedImageName={imageFile?.name}
      />

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Ləğv et
        </Button>
        <Button
          onClick={() => onSubmit(value, imageFile)}
          disabled={!canSubmit}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Yadda saxla
        </Button>
      </div>
    </Modal>
  );
}
