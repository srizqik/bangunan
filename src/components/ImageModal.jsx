import React from 'react';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-4 rounded-lg shadow-xl max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/modal content
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-opacity-75"
          aria-label="Close"
        >
          &times;
        </button>
        <img src={imageUrl} alt="Struk atau Foto Pengeluaran" className="max-w-full max-h-[85vh] object-contain" />
      </div>
    </div>
  );
};

export default ImageModal;
