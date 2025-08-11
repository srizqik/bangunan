import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const ExpenseCard = ({ expense, onImageClick, onEditClick, onDeleteClick }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{expense.jenis_pengeluaran}</CardTitle>
            <CardDescription>{new Date(expense.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
          </div>
          <p className="text-lg font-bold text-right">
            Rp {new Intl.NumberFormat('id-ID').format(expense.biaya)}
          </p>
        </div>
      </CardHeader>
      {expense.deskripsi && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{expense.deskripsi}</p>
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2">
        {expense.image_url && (
          <Button variant="ghost" size="sm" onClick={() => onImageClick(expense.image_url)}>Lihat Foto</Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEditClick()}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => onDeleteClick(expense)}>Hapus</Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseCard;
