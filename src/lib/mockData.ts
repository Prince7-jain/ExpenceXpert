
import { Transaction, Category, TransactionType } from './types';

export const categories: Category[] = [
  { id: 'cat1', name: 'Salary', type: 'income', color: '#4CAF50' },
  { id: 'cat2', name: 'Freelance', type: 'income', color: '#8BC34A' },
  { id: 'cat3', name: 'Investments', type: 'income', color: '#CDDC39' },
  { id: 'cat4', name: 'Gifts', type: 'income', color: '#FFC107' },
  { id: 'cat5', name: 'Housing', type: 'expense', color: '#F44336' },
  { id: 'cat6', name: 'Food', type: 'expense', color: '#FF5722' },
  { id: 'cat7', name: 'Transportation', type: 'expense', color: '#FF9800' },
  { id: 'cat8', name: 'Entertainment', type: 'expense', color: '#E91E63' },
  { id: 'cat9', name: 'Utilities', type: 'expense', color: '#9C27B0' },
  { id: 'cat10', name: 'Healthcare', type: 'expense', color: '#673AB7' },
  { id: 'cat11', name: 'Shopping', type: 'expense', color: '#3F51B5' },
  { id: 'cat12', name: 'Other', type: 'expense', color: '#607D8B' },
];

const today = new Date();

// Function to get a random date within the last 3 months
const getRandomDate = () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const randomTimestamp = threeMonthsAgo.getTime() + Math.random() * (today.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTimestamp).toISOString();
};

// Generate mock transactions
export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 1; i <= count; i++) {
    const type: TransactionType = Math.random() > 0.3 ? 'expense' : 'income';
    const validCategories = categories.filter(cat => cat.type === type);
    const category = validCategories[Math.floor(Math.random() * validCategories.length)];
    
    const amount = type === 'income' 
      ? Math.floor(Math.random() * 2000) + 500 
      : Math.floor(Math.random() * 300) + 10;
    
    const descriptions = {
      income: [
        'Monthly salary', 'Freelance project', 'Stock dividends',
        'Client payment', 'Bonus', 'Side hustle', 'Gift received'
      ],
      expense: [
        'Groceries', 'Restaurant', 'Rent payment', 'Utilities bill',
        'Gasoline', 'Movie tickets', 'Online shopping', 'Doctor visit',
        'Phone bill', 'Internet bill', 'Gym membership', 'Coffee'
      ]
    };
    
    const descList = type === 'income' ? descriptions.income : descriptions.expense;
    const description = descList[Math.floor(Math.random() * descList.length)];
    
    transactions.push({
      id: `trans${i}`,
      amount,
      type,
      category,
      date: getRandomDate(),
      description
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockTransactions = generateMockTransactions(30);

// Calculate some stats from the mock data
export const calculateStats = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  return {
    totalIncome,
    totalExpenses,
    balance
  };
};

// Generate monthly data for the chart
export const generateMonthlyData = (transactions: Transaction[]) => {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  // Initialize with the last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyData[monthKey] = { income: 0, expense: 0 };
  }
  
  // Fill with actual data
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (monthlyData[monthKey]) {
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    }
  });
  
  // Convert to array format for charts
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense
  }));
};

// Generate category summary data for the pie chart
export const generateCategorySummary = (transactions: Transaction[], type: TransactionType = 'expense') => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryMap: { [key: string]: { amount: number; name: string; color: string } } = {};
  
  filteredTransactions.forEach(transaction => {
    const { category } = transaction;
    
    if (!categoryMap[category.id]) {
      categoryMap[category.id] = {
        amount: 0,
        name: category.name,
        color: category.color
      };
    }
    
    categoryMap[category.id].amount += transaction.amount;
  });
  
  return Object.entries(categoryMap).map(([categoryId, data]) => ({
    categoryId,
    categoryName: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total ? Math.round((data.amount / total) * 100) : 0
  }));
};

// Exporting utility functions for when we later implement real functionality
export const utils = {
  calculateStats,
  generateMonthlyData,
  generateCategorySummary
};
