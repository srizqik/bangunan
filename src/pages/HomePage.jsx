import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ImageModal from '../components/ImageModal';
import LoginPromptModal from '../components/LoginPromptModal';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterJenis, setFilterJenis] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const jenisOptions = ['Semua', 'Material Bangunan', 'Upah Tukang', 'Instalasi Listrik', 'Konsumsi', 'Tidak Terduga', 'Biaya Tambahan'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('tanggal', { ascending: false });
      if (error) throw error;
      setAllExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return allExpenses
      .filter(exp => filterJenis === 'Semua' || exp.jenis_pengeluaran === filterJenis)
      .filter(exp => exp.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allExpenses, filterJenis, searchTerm]);

  const totalCost = useMemo(() => {
    return filteredExpenses.reduce((total, exp) => total + parseFloat(exp.biaya), 0);
  }, [filteredExpenses]);

  const handleDelete = async (expense) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengeluaran "${expense.deskripsi || 'ini'}"?`)) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase.from('expenses').delete().match({ id: expense.id });
      if (dbError) throw dbError;

      // Delete image from storage if it exists
      if (expense.image_url) {
        const fileName = expense.image_url.split('/').pop();
        await supabase.storage.from('expense-photos').remove([`public/${fileName}`]);
      }

      // Update UI
      setAllExpenses(allExpenses.filter(e => e.id !== expense.id));
      alert('Pengeluaran berhasil dihapus.');

    } catch (error) {
      console.error('Error deleting expense:', error);
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  const handleActionClick = (action) => {
    if (!user) {
      setIsLoginPromptOpen(true);
    } else {
      action();
    }
  };

  if (loading) return <div className="text-center p-8">Memuat data...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">Error: {error}</div>;

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Rekapitulasi Biaya</h1>
          <div className="text-right">
            <p className="text-gray-500">Total Pengeluaran (Difilter)</p>
            <p className="text-2xl font-bold text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(totalCost)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1"><label htmlFor="search" className="block text-sm font-medium text-gray-700">Cari Deskripsi</label><input type="text" id="search" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/></div>
          <div className="flex-1"><label htmlFor="filter-jenis" className="block text-sm font-medium text-gray-700">Filter Jenis</label><select id="filter-jenis" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">{jenisOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        </div>

        <div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr><th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th><th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th><th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th><th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Biaya (Rp)</th><th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th><th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredExpenses.length === 0 ? (<tr><td colSpan="6" className="text-center py-8 text-gray-500">{allExpenses.length > 0 ? 'Tidak ada hasil yang cocok.' : 'Belum ada data.'}</td></tr>) : (filteredExpenses.map((expense) => (<tr key={expense.id} className="hover:bg-gray-50"><td className="py-4 px-6 whitespace-nowrap">{new Date(expense.tanggal).toLocaleDateString('id-ID')}</td><td className="py-4 px-6 whitespace-nowrap">{expense.jenis_pengeluaran}</td><td className="py-4 px-6 max-w-sm truncate" title={expense.deskripsi}>{expense.deskripsi || '-'}</td><td className="py-4 px-6 whitespace-nowrap text-right font-medium">{new Intl.NumberFormat('id-ID').format(expense.biaya)}</td><td className="py-4 px-6 text-center">{expense.image_url ? (<button onClick={() => setSelectedImageUrl(expense.image_url)} className="text-blue-500 hover:underline">Lihat</button>) : ('-')}</td><td className="py-4 px-6 text-center whitespace-nowrap"><button onClick={() => handleActionClick(() => alert('Halaman edit belum dibuat.'))} className="text-yellow-500 hover:underline mr-4">Edit</button><button onClick={() => handleActionClick(() => handleDelete(expense))} className="text-red-500 hover:underline">Hapus</button></td></tr>)))}</tbody></table></div>
      </div>
      <ImageModal imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
      <LoginPromptModal isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} />
    </>
  );
};

export default HomePage;
