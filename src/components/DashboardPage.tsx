"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import TransactionList from '@/components/TransactionList';
import ExpensePieChart from '@/components/ExpensePieChart';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import SettingsForm from '@/components/SettingsForm';
import ProfileForm from '@/components/ProfileForm';
import BudgetPlanner from '@/components/BudgetPlanner';
import FinancialGoals from '@/components/FinancialGoals';
import BillReminders from '@/components/BillReminders';
import ExpenseAlerts from '@/components/ExpenseAlerts';
import { 
  CircleDollarSign, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/lib/types';
import { toast } from 'sonner';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: session } = useSession();
  const { transactions: rawTransactions, isLoading, refetch } = useTransactions();
  
  // Convert hook transactions to expected format
  const transactions: Transaction[] = rawTransactions.map(t => ({
    id: t._id || '',
    amount: t.amount,
    type: t.type,
    category: {
      id: t.category,
      name: t.category,
      type: t.type,
      color: '#3B82F6'
    },
    date: t.date instanceof Date ? t.date.toISOString() : t.date,
    description: t.description || ''
  }));
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [userSettings, setUserSettings] = useState({ currency: 'INR' });
  
  // Fetch user settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setUserSettings(settings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);
  
  // Calculate financial stats
  const calculateStats = (transactionList: any[]) => {
    const totalIncome = transactionList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactionList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  // Calculate monthly data for bar chart
  const calculateMonthlyData = (transactionList: any[]) => {
    const monthlyMap = transactionList.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[monthYear].income += t.amount;
      } else {
        acc[monthYear].expense += t.amount;
      }
      return acc;
    }, {});
    
    // Sort by month/year (YYYY-MM format sorts naturally)
    const sortedMonths = Object.keys(monthlyMap).sort();
    
    return sortedMonths.map(month => monthlyMap[month]);
  };

  // Calculate category summary for pie chart
  const calculateCategorySummary = useCallback((transactionList: any[]) => {
    const expenseTransactions = transactionList.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (total === 0) {
      return [];
    }
    
    const categoryMap: Record<string, { categoryId: string; categoryName: string; amount: number; color: string }> = {};
    
    expenseTransactions.forEach(transaction => {
      const categoryId = transaction.category;
      const categoryName = getCategoryName(categoryId);
      const categoryColor = getCategoryColor(categoryId);
      
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          categoryId,
          categoryName,
          amount: 0,
          color: categoryColor
        };
      }
      
      categoryMap[categoryId].amount += transaction.amount;
    });
    
    // Convert to array with percentage and sort by amount
    return Object.values(categoryMap)
      .map(item => ({
        ...item,
        percentage: Math.round((item.amount / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, []);

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'food': 'Food & Dining',
      'transportation': 'Transportation',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping',
      'utilities': 'Utilities',
      'healthcare': 'Healthcare',
      'housing': 'Housing',
      'other': 'Other'
    };
    return categoryMap[categoryId] || categoryId;
  };

  // Helper function to get category color from ID
  const getCategoryColor = (categoryId: string) => {
    const colorMap: Record<string, string> = {
      'food': '#FF5722',
      'transportation': '#FF9800', 
      'entertainment': '#E91E63',
      'shopping': '#3F51B5',
      'utilities': '#9C27B0',
      'healthcare': '#673AB7',
      'housing': '#F44336',
      'other': '#607D8B'
    };
    return colorMap[categoryId] || '#607D8B';
  };

  // Calculate stats when transactions change
  useEffect(() => {
    if (rawTransactions) {
      const calculatedStats = calculateStats(rawTransactions);
      setStats(calculatedStats);
      
      // Generate chart data from transactions
      const monthly = calculateMonthlyData(rawTransactions);
      setMonthlyData(monthly);

      const category = calculateCategorySummary(rawTransactions);
      setCategorySummary(category);
    }
  }, [rawTransactions, calculateCategorySummary]);
  
  // Format currency based on user settings
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userSettings.currency || 'USD',
    }).format(amount);
  };

  // Export user data as JSON
  const handleExportData = () => {
    if (!session?.user) {
        toast.error("User not authenticated.");
        return;
    }
    
    const user = session.user;

    const exportData = {
      user: { id: user.id, name: user.name, email: user.email },
      transactions: transactions,
      settings: userSettings
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `finance_data_${user.name}_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Your data has been exported successfully');
  };
  
  // Import user data from JSON file
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          toast.error('Invalid file format');
          return;
        }
        
        const importedData = JSON.parse(result);
        
        // Validate imported data structure
        if (!importedData.user || !importedData.transactions) {
          toast.error('Invalid data format');
          return;
        }
        
        // Check if data belongs to current user
        if (importedData.user.id !== session?.user?.id) {
          toast.error('This data belongs to another user');
          return;
        }
        
        // Refetch transactions from server after import
        await refetch();
        
        if (importedData.settings) {
          setUserSettings(importedData.settings);
          localStorage.setItem('userSettings', JSON.stringify(importedData.settings));
        }
        
        // Calculate stats and chart data
        const calculatedStats = calculateStats(importedData.transactions);
        setStats(calculatedStats);
        
        // In a real app, this would also update the MongoDB database
        toast.success('Your data has been imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data');
      }
    };
    
    reader.readAsText(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard 
                  title="Total Balance" 
                  value={formatCurrency(stats.balance)}
                  description="Current balance across all accounts"
                  icon={<CircleDollarSign className="h-4 w-4" />}
                  trend={{ value: 12, positive: true }}
                />
                <StatsCard 
                  title="Income" 
                  value={formatCurrency(stats.totalIncome)}
                  description="Total income this month"
                  icon={<TrendingUp className="h-4 w-4" />}
                  trend={{ value: 8, positive: true }}
                  className="border-l-4 border-income"
                />
                <StatsCard 
                  title="Expenses" 
                  value={formatCurrency(stats.totalExpenses)}
                  description="Total expenses this month"
                  icon={<TrendingDown className="h-4 w-4" />}
                  trend={{ value: 3, positive: false }}
                  className="border-l-4 border-expense"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Monthly Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyBarChart data={monthlyData} currency={userSettings.currency} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Expenses by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpensePieChart data={categorySummary} currency={userSettings.currency} />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <TransactionList transactions={transactions.slice(0, 5)} currency={userSettings.currency} />
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">No transactions found. Add your first transaction to see the dashboard.</p>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Data Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Button className="w-full" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
                <div>
                  <Button className="w-full" onClick={() => document.getElementById('import-data')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                  <input 
                    type="file" 
                    id="import-data" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImportData} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">Loading transactions...</div>
              ) : (
                <TransactionList transactions={transactions} currency={userSettings.currency} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Loading chart data...</p></div>
              ) : categorySummary.length > 0 ? (
                <ExpensePieChart data={categorySummary} currency={userSettings.currency} />
              ) : (
                <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">No expense data to display chart.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Monthly Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Loading chart data...</p></div>
              ) : monthlyData.length > 0 ? (
                <MonthlyBarChart data={monthlyData} currency={userSettings.currency} />
              ) : (
                <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">No monthly transaction data to display chart.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === 'budget' && (
        <div className="animate-fade-in">
          <BudgetPlanner currency={userSettings.currency} userId={session?.user?.id} />
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="animate-fade-in">
          <FinancialGoals />
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="animate-fade-in">
          <BillReminders />
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="animate-fade-in">
          <ExpenseAlerts />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Application Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsForm />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;