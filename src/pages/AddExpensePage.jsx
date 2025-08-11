import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
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

const formSchema = z.object({
  jenis_pengeluaran: z.string().min(1, "Jenis pengeluaran harus dipilih."),
  deskripsi: z.string().optional(),
  biaya: z.coerce.number().min(1, "Biaya harus lebih dari 0."),
  tanggal: z.date({ required_error: "Tanggal harus diisi." }),
  foto: z.instanceof(File).optional(),
});

const AddExpensePage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the user from auth context

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenis_pengeluaran: "Material Bangunan",
      deskripsi: "",
      biaya: 0,
      tanggal: new Date(),
    },
  });

  const onSubmit = async (values) => {
    if (!user) {
      toast.error("Anda harus login untuk menyimpan data.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (values.foto) {
        const fileExt = values.foto.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Prefix with user id for better organization
        const filePath = `public/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('expense-photos').upload(filePath, values.foto);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('expense-photos').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const expenseData = {
        jenis_pengeluaran: values.jenis_pengeluaran,
        deskripsi: values.deskripsi,
        biaya: values.biaya,
        tanggal: format(values.tanggal, "yyyy-MM-dd"),
        image_url: imageUrl,
        user_id: user.id, // Add the user_id to the insert object
      };

      const { error: insertError } = await supabase
        .from('expenses')
        .insert([expenseData]);

      if (insertError) throw insertError;

      toast.success("Pengeluaran berhasil disimpan!");
      navigate('/');

    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error("Gagal menyimpan pengeluaran.", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Tambah Pengeluaran Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="jenis_pengeluaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pengeluaran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Pilih jenis pengeluaran" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Material Bangunan">Material Bangunan</SelectItem>
                      <SelectItem value="Upah Tukang">Upah Tukang</SelectItem>
                      <SelectItem value="Instalasi Listrik">Instalasi Listrik</SelectItem>
                      <SelectItem value="Konsumsi">Konsumsi</SelectItem>
                      <SelectItem value="Tidak Terduga">Tidak Terduga</SelectItem>
                      <SelectItem value="Biaya Tambahan">Biaya Tambahan</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contoh: Beli 10 sak semen tiga roda" {...field} />
                  </FormControl>
                  <FormDescription>Deskripsi singkat (opsional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="biaya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="550000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Foto</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddExpensePage;
