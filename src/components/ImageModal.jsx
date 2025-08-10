import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ImageModal = ({ imageUrl, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Lihat Foto</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Struk atau Foto Pengeluaran"
            className="max-w-full max-h-[80vh] object-contain mx-auto rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
