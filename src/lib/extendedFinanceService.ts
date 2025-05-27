
import { FinancialGoal, BillReminder, ExpenseAlert, Transaction } from '@/lib/types';

// Financial Goals Service
export const getFinancialGoals = async (userId: string): Promise<FinancialGoal[]> => {
  try {
    const storedData = localStorage.getItem(`financial_goals_${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return [];
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    return [];
  }
};

export const addFinancialGoal = async (userId: string, goal: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> => {
  try {
    const newGoal = {
      ...goal,
      id: `goal-${Date.now()}`
    };
    
    const existingGoals = await getFinancialGoals(userId);
    const updatedGoals = [...existingGoals, newGoal];
    
    localStorage.setItem(`financial_goals_${userId}`, JSON.stringify(updatedGoals));
    return newGoal;
  } catch (error) {
    console.error('Error adding financial goal:', error);
    throw new Error('Failed to add financial goal');
  }
};

export const updateFinancialGoal = async (userId: string, goalId: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> => {
  try {
    const existingGoals = await getFinancialGoals(userId);
    const index = existingGoals.findIndex(g => g.id === goalId);
    
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal = { ...existingGoals[index], ...updates };
    existingGoals[index] = updatedGoal;
    
    localStorage.setItem(`financial_goals_${userId}`, JSON.stringify(existingGoals));
    return updatedGoal;
  } catch (error) {
    console.error('Error updating financial goal:', error);
    throw new Error('Failed to update financial goal');
  }
};

// Bill Reminders Service
export const getBillReminders = async (userId: string): Promise<BillReminder[]> => {
  try {
    const storedData = localStorage.getItem(`bill_reminders_${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return [];
  } catch (error) {
    console.error('Error fetching bill reminders:', error);
    return [];
  }
};

export const addBillReminder = async (userId: string, bill: Omit<BillReminder, 'id'>): Promise<BillReminder> => {
  try {
    const newBill = {
      ...bill,
      id: `bill-${Date.now()}`
    };
    
    const existingBills = await getBillReminders(userId);
    const updatedBills = [...existingBills, newBill];
    
    localStorage.setItem(`bill_reminders_${userId}`, JSON.stringify(updatedBills));
    return newBill;
  } catch (error) {
    console.error('Error adding bill reminder:', error);
    throw new Error('Failed to add bill reminder');
  }
};

export const updateBillReminder = async (userId: string, billId: string, updates: Partial<BillReminder>): Promise<BillReminder> => {
  try {
    const existingBills = await getBillReminders(userId);
    const index = existingBills.findIndex(b => b.id === billId);
    
    if (index === -1) {
      throw new Error('Bill not found');
    }
    
    const updatedBill = { ...existingBills[index], ...updates };
    existingBills[index] = updatedBill;
    
    localStorage.setItem(`bill_reminders_${userId}`, JSON.stringify(existingBills));
    return updatedBill;
  } catch (error) {
    console.error('Error updating bill reminder:', error);
    throw new Error('Failed to update bill reminder');
  }
};

// Expense Alerts Service
export const getExpenseAlerts = async (userId: string): Promise<ExpenseAlert[]> => {
  try {
    const storedData = localStorage.getItem(`expense_alerts_${userId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return [];
  } catch (error) {
    console.error('Error fetching expense alerts:', error);
    return [];
  }
};

export const addExpenseAlert = async (userId: string, alert: Omit<ExpenseAlert, 'id'>): Promise<ExpenseAlert> => {
  try {
    const newAlert = {
      ...alert,
      id: `alert-${Date.now()}`
    };
    
    const existingAlerts = await getExpenseAlerts(userId);
    const updatedAlerts = [...existingAlerts, newAlert];
    
    localStorage.setItem(`expense_alerts_${userId}`, JSON.stringify(updatedAlerts));
    return newAlert;
  } catch (error) {
    console.error('Error adding expense alert:', error);
    throw new Error('Failed to add expense alert');
  }
};

export const markAlertAsRead = async (userId: string, alertId: string): Promise<void> => {
  try {
    const existingAlerts = await getExpenseAlerts(userId);
    const index = existingAlerts.findIndex(a => a.id === alertId);
    
    if (index !== -1) {
      existingAlerts[index].isRead = true;
      localStorage.setItem(`expense_alerts_${userId}`, JSON.stringify(existingAlerts));
    }
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
};

// Receipt Upload Service
export const uploadReceipt = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Smart Alert Generation
export const generateSmartAlerts = async (userId: string, transactions: Transaction[]): Promise<ExpenseAlert[]> => {
  const alerts: ExpenseAlert[] = [];
  
  // Check for unusual spending patterns
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date.startsWith(thisMonth)
  );
  
  const totalThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  // Example alert for high spending
  if (totalThisMonth > 50000) { // 50k INR threshold
    alerts.push({
      id: `alert-${Date.now()}`,
      type: 'unusual_spending',
      message: `High spending detected this month: ₹${totalThisMonth.toLocaleString()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'high'
    });
  }
  
  return alerts;
};
