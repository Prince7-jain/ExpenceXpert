
import { Transaction, MonthlyData, CategorySummary } from '@/lib/types';

// In a real app, these functions would make API calls to a backend server
// which would then interact with MongoDB. For now, we'll use localStorage as a simple store

// Get all transactions for a user
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    // Get transactions from localStorage
    const storedData = localStorage.getItem(`transactions_${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If no stored data, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Add a new transaction
export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  try {
    // Generate a new ID
    const newTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`
    };
    
    // Get existing transactions
    const existingTransactions = await getTransactions(userId);
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, newTransaction];
    
    // Save to localStorage
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(updatedTransactions));
    
    return newTransaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction');
  }
};

// Delete a transaction
export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  try {
    // Get existing transactions
    const existingTransactions = await getTransactions(userId);
    
    // Filter out the transaction to delete
    const updatedTransactions = existingTransactions.filter(t => t.id !== transactionId);
    
    // Save to localStorage
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
};

// Update a transaction
export const updateTransaction = async (userId: string, transactionId: string, updates: Partial<Transaction>): Promise<Transaction> => {
  try {
    // Get existing transactions
    const existingTransactions = await getTransactions(userId);
    
    // Find transaction to update
    const index = existingTransactions.findIndex(t => t.id === transactionId);
    
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    // Update transaction
    const updatedTransaction = { ...existingTransactions[index], ...updates };
    existingTransactions[index] = updatedTransaction;
    
    // Save to localStorage
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(existingTransactions));
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
};

// Generate monthly data for charts
export const getMonthlyData = async (userId: string): Promise<MonthlyData[]> => {
  try {
    // Get all transactions
    const transactions = await getTransactions(userId);
    
    // Group transactions by month
    const monthlyData = transactions.reduce((acc: Record<string, MonthlyData>, transaction) => {
      const date = new Date(transaction.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = {
          month,
          income: 0,
          expense: 0
        };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error generating monthly data:', error);
    return [];
  }
};

// Generate category summary for pie chart
export const getCategorySummary = async (userId: string, type: 'income' | 'expense'): Promise<CategorySummary[]> => {
  try {
    // Get all transactions
    const transactions = await getTransactions(userId);
    
    // Filter by type and group by category
    const filteredTransactions = transactions.filter(t => t.type === type);
    
    // Group by category
    const categoryTotal: Record<string, number> = {};
    const categoryDetails: Record<string, { name: string, color: string }> = {};
    
    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category.id;
      
      if (!categoryTotal[categoryId]) {
        categoryTotal[categoryId] = 0;
        categoryDetails[categoryId] = {
          name: transaction.category.name,
          color: transaction.category.color
        };
      }
      
      categoryTotal[categoryId] += transaction.amount;
    });
    
    // Calculate total amount
    const totalAmount = Object.values(categoryTotal).reduce((sum, amount) => sum + amount, 0);
    
    // Convert to array and calculate percentages
    return Object.entries(categoryTotal).map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryDetails[categoryId].name,
      amount,
      color: categoryDetails[categoryId].color,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
  } catch (error) {
    console.error('Error generating category summary:', error);
    return [];
  }
};
