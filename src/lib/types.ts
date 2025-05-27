
export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string
  description: string;
  receiptUrl?: string; // New field for receipt images
};

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export type CategorySummary = {
  categoryId: string;
  categoryName: string;
  amount: number;
  color: string;
  percentage: number;
};

// New types for additional features
export type FinancialGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  description?: string;
  isCompleted: boolean;
};

export type BillReminder = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: Category;
  isRecurring: boolean;
  recurringType?: 'monthly' | 'weekly' | 'yearly';
  isPaid: boolean;
  description?: string;
};

export type ExpenseAlert = {
  id: string;
  type: 'budget_limit' | 'unusual_spending' | 'goal_deadline';
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
};
