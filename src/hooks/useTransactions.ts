import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Transaction {
  _id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  description?: string;
  userId?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchTransactions = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, '_id' | 'userId'>) => {
    if (!session) return false;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions(prev => [newTransaction, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  };

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    refetch: fetchTransactions,
  };
};