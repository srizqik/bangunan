import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import ImageModal from '@/components/ImageModal';
import LoginPromptModal from '@/components/LoginPromptModal';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const HomePageSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-80" /></div>
      <div className="text-right"><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-8 w-48" /></div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col md:flex-row gap-4 mb-6"><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div></div>
      <div className="rounded-md border"><Table><TableHeader><TableRow>{Array(6).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader><TableBody>{Array(5).fill(0).map((_, i) => (<TableRow key={i}>{Array(6).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody></Table></div>
    </CardContent>
  </Card>
);

const HomePage = () => {
  const { user } = useAuth();
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const jenisOptions = ['Semua', 'Material Bangunan', 'Upah Tukang', 'Instalasi Listrik', 'Konsumsi', 'Tidak Terduga', 'Biaya Tambahan'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setTimeout(async () => {
      try {
        const { data, error } = await supabase.from('expenses').select('*').order('tanggal', { ascending: false });
        if (error) throw error;
        setAllExpenses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const filteredExpenses = useMemo(() => allExpenses.filter(exp => (filterJenis === 'Semua' || exp.jenis_pengeluaran === filterJenis) && exp.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())), [allExpenses, filterJenis, searchTerm]);
  const totalCost = useMemo(() => filteredExpenses.reduce((total, exp) => total + parseFloat(exp.biaya), 0), [filteredExpenses]);

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      const { error: dbError } = await supabase.from('expenses').delete().match({ id: expenseToDelete.id });
      if (dbError) throw dbError;
      if (expenseToDelete.image_url) {
        const fileName = expenseToDelete.image_url.split('/').pop();
        await supabase.storage.from('expense-photos').remove([`public/${fileName}`]);
      }
      setAllExpenses(allExpenses.filter(e => e.id !== expenseToDelete.id));
      toast.success("Pengeluaran berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus pengeluaran.", { description: error.message });
    } finally {
      setExpenseToDelete(null);
    }
  };

  const handleActionClick = (action, expense) => {
    if (!user) setIsLoginPromptOpen(true);
    else action(expense);
  };

  if (loading) return <HomePageSkeleton />;
  if (error) return <div className="text-destructive p-4 text-center">{error}</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div><CardTitle className="text-2xl">Rekapitulasi Biaya</CardTitle><CardDescription>Daftar semua pengeluaran yang tercatat.</CardDescription></div>
          <div className="text-right"><p className="text-sm text-muted-foreground">Total Pengeluaran (Difilter)</p><p className="text-2xl font-bold">Rp {new Intl.NumberFormat('id-ID').format(totalCost)}</p></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1"><label htmlFor="search" className="block text-sm font-medium mb-2">Cari Deskripsi</label><Input type="text" id="search" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="flex-1"><label htmlFor="filter-jenis" className="block text-sm font-medium mb-2">Filter Jenis</label><Select onValueChange={setFilterJenis} defaultValue={filterJenis}><SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger><SelectContent>{jenisOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Jenis</TableHead><TableHead>Deskripsi</TableHead><TableHead className="text-right">Biaya (Rp)</TableHead><TableHead className="text-center">Foto</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader><TableBody>{filteredExpenses.length === 0 ? (<TableRow><TableCell colSpan="6" className="h-24 text-center text-muted-foreground">{allExpenses.length > 0 ? 'Tidak ada hasil yang cocok.' : 'Belum ada data.'}</TableCell></TableRow>) : (filteredExpenses.map((expense) => (<TableRow key={expense.id}><TableCell className="font-medium whitespace-nowrap">{new Date(expense.tanggal).toLocaleDateString('id-ID')}</TableCell><TableCell>{expense.jenis_pengeluaran}</TableCell><TableCell className="max-w-xs truncate" title={expense.deskripsi}>{expense.deskripsi || '-'}</TableCell><TableCell className="text-right whitespace-nowrap">{new Intl.NumberFormat('id-ID').format(expense.biaya)}</TableCell><TableCell className="text-center"><Button variant="link" size="sm" onClick={() => setSelectedImageUrl(expense.image_url)} disabled={!expense.image_url}>Lihat</Button></TableCell><TableCell className="text-center space-x-2 whitespace-nowrap"><Button variant="outline" size="sm" onClick={() => handleActionClick(() => toast.info('Fitur Edit belum diimplementasikan.'))}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleActionClick(setExpenseToDelete, expense)}>Hapus</Button></TableCell></TableRow>)))}</TableBody></Table></div>
        </CardContent>
      </Card>
      {selectedImageUrl && (<ImageModal imageUrl={selectedImageUrl} isOpen={!!selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />)}
      <LoginPromptModal isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} />
      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini tidak dapat dibatalkan. Ini akan menghapus data pengeluaran secara permanen.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HomePage;
