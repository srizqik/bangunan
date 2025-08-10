import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Aksi Dibatasi</h3>
        <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu untuk dapat mengedit atau menghapus data.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md"
          >
            Tutup
          </button>
          <button
            onClick={handleLoginRedirect}
            className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
