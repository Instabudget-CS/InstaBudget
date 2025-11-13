'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Sparkles, X, Edit3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp, type Category, type TransactionKind } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function ScanPage() {
  const router = useRouter();
  const { addReceipt, addTransaction, linkReceiptToTransaction } = useApp();

  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [txnDate, setTxnDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        mockAIExtraction();
      };
      reader.readAsDataURL(file);
    }
  };

  const mockAIExtraction = () => {
    setIsExtracting(true);

    // Mock AI extraction
    setTimeout(() => {
      const mockData = {
        merchant: 'Whole Foods Market',
        amount: '47.82',
        category: 'groceries' as Category,
        txnDate: new Date().toISOString().split('T')[0],
      };

      setMerchant(mockData.merchant);
      setAmount(mockData.amount);
      setCategory(mockData.category);
      setTxnDate(mockData.txnDate);
      setIsExtracting(false);
      setIsEditing(true);

      toast({
        title: 'Success',
        description: 'Receipt data extracted successfully',
      });
    }, 2000);
  };

  const handleSave = () => {
    if (!merchant || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in merchant and amount',
        variant: 'destructive',
      });
      return;
    }

    // Add receipt only if there's an image
    let receiptId: string | undefined;
    if (receiptImage) {
      receiptId = Math.random().toString(36).substring(7);
      addReceipt({
        url: receiptImage,
      });
    }

    // Add transaction
    const transactionId = Math.random().toString(36).substring(7);
    addTransaction({
      kind,
      merchant,
      amount: Number.parseFloat(amount),
      currency: 'USD',
      category,
      txn_date: txnDate,
      notes,
      receiptId,
    });

    if (receiptId) {
      linkReceiptToTransaction(receiptId, transactionId);
    }

    toast({
      title: 'Success',
      description: receiptImage
        ? 'Receipt saved successfully'
        : 'Transaction saved successfully',
    });

    // Reset form
    setReceiptImage(null);
    setIsEditing(false);
    setMerchant('');
    setAmount('');
    setCategory('other');
    setNotes('');

    router.push(receiptImage ? '/receipts' : '/transactions');
  };

  const handleCancel = () => {
    setReceiptImage(null);
    setIsEditing(false);
    setMerchant('');
    setAmount('');
    setCategory('other');
    setNotes('');
  };

  const TransactionForm = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kind">Type</Label>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as TransactionKind)}
          >
            <SelectTrigger id="kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchant">Merchant</Label>
        <Input
          id="merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Store or merchant name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save Transaction
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground mt-2">
          Scan a receipt or enter transaction details manually
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'scan' | 'manual')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan" className="gap-2">
            <Camera className="h-4 w-4" />
            Scan Receipt
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-6">
          {!receiptImage ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload Receipt</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of your receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Upload a receipt
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PNG, JPG or HEIC up to 10MB
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button asChild>
                      <label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Receipt Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Receipt Image</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={receiptImage || '/placeholder.svg'}
                      alt="Receipt"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Extraction Status */}
              {isExtracting && (
                <Card className="border-primary bg-primary/5">
                  <CardContent className="flex items-center gap-3 py-4">
                    <Sparkles className="h-5 w-5 animate-pulse text-primary" />
                    <div>
                      <p className="font-medium">Extracting data...</p>
                      <p className="text-sm text-muted-foreground">
                        AI is reading your receipt
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                    <CardDescription>
                      Review and edit the extracted information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Transaction Details</CardTitle>
              <CardDescription>
                Manually add a transaction without a receipt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
