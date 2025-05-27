
import React from 'react';
import { Transaction } from '@/lib/types';
import { CircleDollarSign, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSession } from "next-auth/react";
import { deleteTransaction } from '@/lib/transactionService';

type TransactionListProps = {
  transactions: Transaction[];
  className?: string;
  currency?: string;
  onDelete?: () => void;
};

const TransactionList = ({ transactions, className, currency = 'USD', onDelete }: TransactionListProps) => {
  const { data: session } = useSession();
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle transaction deletion
  const handleDelete = async (transactionId: string) => {
    if (!session?.user?.id) return;
    
    try {
      await deleteTransaction(session.user.id, transactionId);
      toast.success('Transaction deleted successfully');
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <CircleDollarSign className="h-10 w-10 mb-2" />
          <h3 className="font-medium">No transactions yet</h3>
          <p className="text-sm">Start tracking your finances by adding transactions.</p>
        </div>
      ) : (
        transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="transaction-item flex items-center justify-between rounded-md p-2 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: transaction.category.color + '20' }}
              >
                <div 
                  className="w-5 h-5 rounded-full" 
                  style={{ backgroundColor: transaction.category.color }}
                />
              </div>
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-xs text-muted-foreground">
                  {transaction.category.name} • {formatDate(transaction.date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "font-medium",
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(transaction.id)}
                className="h-8 w-8 opacity-50 hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;
