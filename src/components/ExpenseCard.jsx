import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const ExpenseCard = ({ expense, onImageClick, onEditClick, onDeleteClick }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            {/* Swapped styling: description is now the main, bold title */}
            <CardTitle className="text-lg font-bold">{expense.deskripsi || 'Tanpa Deskripsi'}</CardTitle>
            {/* Expense type is now standard text */}
            <CardDescription className="text-sm">{expense.jenis_pengeluaran}</CardDescription>
          </div>
          <p className="text-lg font-bold text-right flex-shrink-0">
            Rp {new Intl.NumberFormat('id-ID').format(expense.biaya)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Date is now in the content for better flow */}
        <p className="text-xs text-muted-foreground">
          {new Date(expense.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {expense.image_url && (
          <Button variant="secondary" size="sm" onClick={() => onImageClick(expense.image_url)}>Lihat Foto</Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEditClick()}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => onDeleteClick(expense)}>Hapus</Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseCard;
