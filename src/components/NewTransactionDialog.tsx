import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { useTransactions } from "@/hooks/useTransactions";
import Image from 'next/image';

const expenseCategories = [
  { id: "food", name: "Food & Dining", color: "#FF5722" },
  { id: "transport", name: "Transportation", color: "#2196F3" },
  { id: "utilities", name: "Utilities", color: "#4CAF50" },
  { id: "entertainment", name: "Entertainment", color: "#9C27B0" },
  { id: "health", name: "Healthcare", color: "#F44336" },
  { id: "shopping", name: "Shopping", color: "#FF9800" },
  { id: "housing", name: "Housing", color: "#795548" },
  { id: "other", name: "Other", color: "#607D8B" },
];

const incomeCategories = [
  { id: "salary", name: "Salary", color: "#4CAF50" },
  { id: "freelance", name: "Freelance", color: "#2196F3" },
  { id: "investments", name: "Investments", color: "#FF9800" },
  { id: "gifts", name: "Gifts", color: "#E91E63" },
  { id: "other", name: "Other", color: "#607D8B" },
];

type NewTransactionDialogProps = {
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const NewTransactionDialog = ({ triggerOpen, onOpenChange }: NewTransactionDialogProps) => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [userCurrency, setUserCurrency] = useState("INR");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");

  const { data: session } = useSession();
  const { addTransaction } = useTransactions();

  // Handle external trigger
  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  // Handle open state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);

  // Load user currency preference from settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.currency) {
          setUserCurrency(settings.currency);
        }
      } catch (error) {
        console.error('Error parsing user settings:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    
    if (!session) {
      toast.error("You must be logged in to add transactions");
      return;
    }
    
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    const selectedCategory = categories.find(c => c.id === category);
    
    if (!selectedCategory) {
      toast.error("Invalid category");
      return;
    }
    
    try {
      // Create transaction object
      const transactionData = {
        title: description || `${selectedCategory.name} ${type}`,
        amount: Number(amount),
        category: selectedCategory.id,
        type,
        description,
        date,
      };
      
      // Add transaction to storage
      const result = await addTransaction(transactionData);
      
      if (result) {
        toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
        
        // Reset form
        setAmount("");
        setCategory("");
        setDescription("");
        setDate(new Date());
        setReceiptFile(null);
        setReceiptPreview("");
        setOpen(false);
      } else {
        toast.error('Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Create a new transaction to track your finances.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="expense" className="w-full my-4" onValueChange={(v) => setType(v as "expense" | "income")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {userCurrency}
                </span>
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12 text-right"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === "expense" ? expenseCategories : incomeCategories).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="receipt" className="text-right pt-2">
                Receipt
              </Label>
              <div className="col-span-3">
                {!receiptFile ? (
                  <div>
                    <input
                      type="file"
                      id="receipt"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('receipt')?.click()}
                      className="w-full"
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach Receipt
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{receiptFile.name}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={removeReceipt}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {receiptPreview && (
                      <Image
                        src={receiptPreview}
                        alt="Receipt preview"
                        width={128}
                        height={128}
                        className="w-full max-h-32 object-cover rounded border"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Save Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionDialog;
