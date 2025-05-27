import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  userId?: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchBudgets = async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBudget = async (budget: Omit<Budget, '_id' | 'userId'>) => {
    if (!session) return false;

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });

      if (response.ok) {
        const newBudget = await response.json();
        setBudgets(prev => [newBudget, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding budget:', error);
      return false;
    }
  };

  useEffect(() => {
    if (session) {
      fetchBudgets();
    }
  }, [session]);

  return {
    budgets,
    isLoading,
    addBudget,
    refetch: fetchBudgets,
  };
};