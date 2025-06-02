import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Bell, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { getBillReminders, addBillReminder, updateBillReminder } from '@/lib/extendedFinanceService';
import { BillReminder } from '@/lib/types';
import { toast } from 'sonner';

const expenseCategories = [
  { id: "utilities", name: "Utilities", color: "#4CAF50" },
  { id: "housing", name: "Housing", color: "#795548" },
  { id: "transport", name: "Transportation", color: "#2196F3" },
  { id: "food", name: "Food & Dining", color: "#FF5722" },
  { id: "entertainment", name: "Entertainment", color: "#9C27B0" },
  { id: "health", name: "Healthcare", color: "#F44336" },
  { id: "other", name: "Other", color: "#607D8B" },
];

const BillReminders = () => {
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    title: '',
    amount: '',
    dueDate: '',
    category: '',
    isRecurring: false,
    recurringType: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    description: ''
  });
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      loadBills();
    }
  }, [session?.user]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const loadBills = async () => {
    if (!session?.user?.id) return;
    try {
      const userBills = await getBillReminders(session.user.id);
      setBills(userBills);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const selectedCategory = expenseCategories.find(c => c.id === newBill.category);
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      const billData = {
        title: newBill.title,
        amount: Number(newBill.amount),
        dueDate: newBill.dueDate,
        category: {
          id: selectedCategory.id,
          name: selectedCategory.name,
          type: 'expense' as const,
          color: selectedCategory.color
        },
        isRecurring: newBill.isRecurring,
        recurringType: newBill.isRecurring ? newBill.recurringType : undefined,
        isPaid: false,
        description: newBill.description
      };

      await addBillReminder(session.user.id, billData);
      await loadBills();
      setIsDialogOpen(false);
      setNewBill({
        title: '',
        amount: '',
        dueDate: '',
        category: '',
        isRecurring: false,
        recurringType: 'monthly',
        description: ''
      });
      toast.success('Bill reminder added successfully!');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill reminder');
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    if (!session?.user?.id) return;
    
    try {
      await updateBillReminder(session.user.id, billId, { isPaid: true });
      await loadBills();
      toast.success('Bill marked as paid!');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingBills = bills.filter(bill => !bill.isPaid && getDaysUntilDue(bill.dueDate) >= 0);
  const overdueBills = bills.filter(bill => !bill.isPaid && getDaysUntilDue(bill.dueDate) < 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bill Reminders</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bill Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <Label htmlFor="title">Bill Title</Label>
                <Input
                  id="title"
                  value={newBill.title}
                  onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                  placeholder="e.g., Electricity Bill"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="2500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newBill.category} onValueChange={(value) => setNewBill({ ...newBill, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={newBill.isRecurring}
                  onCheckedChange={(checked) => setNewBill({ ...newBill, isRecurring: checked as boolean })}
                />
                <Label htmlFor="recurring">Recurring Bill</Label>
              </div>
              {newBill.isRecurring && (
                <div>
                  <Label htmlFor="recurringType">Frequency</Label>
                  <Select value={newBill.recurringType} onValueChange={(value) => setNewBill({ ...newBill, recurringType: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full">Add Bill Reminder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {overdueBills.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Overdue Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: bill.category.color + '20' }}
                    >
                      <Bell className="h-5 w-5" style={{ color: bill.category.color }} />
                    </div>
                    <div>
                      <div className="font-medium">{bill.title}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{bill.amount.toLocaleString()} • {Math.abs(getDaysUntilDue(bill.dueDate))} days overdue
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleMarkAsPaid(bill.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Paid
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming bills</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map((bill) => {
                const daysUntilDue = getDaysUntilDue(bill.dueDate);
                return (
                  <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: bill.category.color + '20' }}
                      >
                        <Clock className="h-5 w-5" style={{ color: bill.category.color }} />
                      </div>
                      <div>
                        <div className="font-medium">{bill.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{bill.amount.toLocaleString()} • Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                          {bill.isRecurring && ` • ${bill.recurringType}`}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(bill.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillReminders;
