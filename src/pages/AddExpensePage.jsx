import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AddExpensePage = () => {
  const [jenis, setJenis] = useState('Material Bangunan');
  const [deskripsi, setDeskripsi] = useState('');
  const [biaya, setBiaya] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!biaya || !tanggal) {
      setError('Biaya dan Tanggal wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // 1. Handle file upload
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('expense-photos')
          .upload(filePath, foto);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('expense-photos')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // 2. Insert data into database
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([{
          jenis_pengeluaran: jenis,
          deskripsi,
          biaya: parseFloat(biaya),
          tanggal,
          image_url: imageUrl,
         }]);

      if (insertError) {
        throw insertError;
      }

      // 3. Success: clear form and navigate
      alert('Pengeluaran berhasil disimpan!');
      navigate('/');

    } catch (error) {
      console.error('Error saving expense:', error);
      setError(error.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const formInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100";
  const formLabelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tambah Pengeluaran Baru</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jenis-pengeluaran" className={formLabelClass}>Jenis Pengeluaran</label>
          <select id="jenis-pengeluaran" value={jenis} onChange={(e) => setJenis(e.target.value)} className={formInputClass} disabled={loading}>
            <option>Material Bangunan</option>
            <option>Upah Tukang</option>
            <option>Instalasi Listrik</option>
            <option>Konsumsi</option>
            <option>Tidak Terduga</option>
            <option>Biaya Tambahan</option>
          </select>
        </div>
        <div>
          <label htmlFor="deskripsi" className={formLabelClass}>Deskripsi</label>
          <textarea id="deskripsi" rows="3" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className={formInputClass} placeholder="Contoh: Beli 10 sak semen tiga roda" disabled={loading}></textarea>
        </div>
        <div>
          <label htmlFor="biaya" className={formLabelClass}>Biaya</label>
          <input type="number" id="biaya" value={biaya} onChange={(e) => setBiaya(e.target.value)} className={formInputClass} placeholder="Contoh: 550000" required disabled={loading} />
        </div>
        <div>
          <label htmlFor="tanggal" className={formLabelClass}>Tanggal</label>
          <input type="date" id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={formInputClass} required disabled={loading} />
        </div>
        <div>
          <label htmlFor="foto" className={formLabelClass}>Ambil Foto atau Upload Foto</label>
          <input type="file" id="foto" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={loading} />
        </div>
        <div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage;
