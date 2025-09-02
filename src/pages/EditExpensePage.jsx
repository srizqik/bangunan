import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  jenis_pengeluaran: z.string().min(1, "Jenis pengeluaran harus dipilih."),
  deskripsi: z.string().optional(),
  biaya: z.coerce.number().min(1, "Biaya harus lebih dari 0."),
  tanggal: z.date({ required_error: "Tanggal harus diisi." }),
  foto: z.any().optional(),
});

const EditExpensePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalExpense, setOriginalExpense] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchExpense = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setOriginalExpense(data);
          form.reset({ ...data, tanggal: parseISO(data.tanggal) });
        }
      } catch (error) {
        toast.error("Gagal mengambil data.", { description: error.message });
        navigate('/');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchExpense();
  }, [id, form, navigate]);

  const onSubmit = async (values) => {
    if (!user) {
      toast.error("Anda harus login untuk menyimpan data.");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = originalExpense.image_url;
      if (values.foto && values.foto instanceof File) {
        const fileExt = values.foto.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('expense-photos').upload(filePath, values.foto);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('expense-photos').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
        if (originalExpense.image_url) {
          const oldFileName = originalExpense.image_url.split('/').pop();
          await supabase.storage.from('expense-photos').remove([`public/${oldFileName}`]);
        }
      }
      const updateData = {
        jenis_pengeluaran: values.jenis_pengeluaran,
        deskripsi: values.deskripsi,
        biaya: values.biaya,
        tanggal: format(values.tanggal, "yyyy-MM-dd"),
        image_url: imageUrl,
      };
      const { error: updateError } = await supabase.from('expenses').update(updateData).eq('id', id);
      if (updateError) throw updateError;
      toast.success("Perubahan berhasil disimpan!");
      navigate('/');
    } catch (error) {
      toast.error("Gagal menyimpan perubahan.", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-4"><Skeleton className="h-96 w-full" /></div>

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle className="text-2xl">Edit Pengeluaran</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="jenis_pengeluaran" render={({ field }) => (<FormItem><FormLabel>Jenis Pengeluaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis pengeluaran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Ka Malik">Ka Malik</SelectItem><SelectItem value="Hutang">Hutang</SelectItem><SelectItem value="Material Bangunan">Material Bangunan</SelectItem><SelectItem value="Upah Tukang">Upah Tukang</SelectItem><SelectItem value="Instalasi Listrik">Instalasi Listrik</SelectItem><SelectItem value="Konsumsi">Konsumsi</SelectItem><SelectItem value="Tidak Terduga">Tidak Terduga</SelectItem><SelectItem value="Biaya Tambahan">Biaya Tambahan</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea placeholder="Contoh: Beli 10 sak semen tiga roda" {...field} /></FormControl><FormDescription>Deskripsi singkat (opsional).</FormDescription><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="biaya" render={({ field }) => (<FormItem><FormLabel>Biaya</FormLabel><FormControl><Input type="number" placeholder="550000" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="tanggal" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Tanggal</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
            {originalExpense?.image_url && <div className="space-y-2"><FormLabel>Foto Saat Ini</FormLabel><img src={originalExpense.image_url} alt="Foto pengeluaran" className="rounded-md max-h-48" /></div>}
            <FormField control={form.control} name="foto" render={({ field }) => (<FormItem><FormLabel>Ganti Foto (Opsional)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl><FormDescription>Pilih file baru jika Anda ingin mengganti foto lama.</FormDescription><FormMessage /></FormItem>)} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Menyimpan..." : "Simpan Perubahan"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditExpensePage;
