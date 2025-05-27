
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Save, AlertTriangle, Edit, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from "next-auth/react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions, Transaction } from '@/hooks/useTransactions';

type BudgetCategory = {
  id: string;
  name: string;
  budgetAmount: number;
  currentSpent: number;
  color: string;
  isCustom?: boolean;
};

const DEFAULT_BUDGET_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', budgetAmount: 400, currentSpent: 0, color: '#FF5722' },
  { id: 'transport', name: 'Transportation', budgetAmount: 200, currentSpent: 0, color: '#2196F3' },
  { id: 'utilities', name: 'Utilities', budgetAmount: 300, currentSpent: 0, color: '#4CAF50' },
  { id: 'entertainment', name: 'Entertainment', budgetAmount: 150, currentSpent: 0, color: '#9C27B0' },
  { id: 'health', name: 'Healthcare', budgetAmount: 150, currentSpent: 0, color: '#F44336' },
  { id: 'shopping', name: 'Shopping', budgetAmount: 200, currentSpent: 0, color: '#FF9800' },
  { id: 'housing', name: 'Housing', budgetAmount: 800, currentSpent: 0, color: '#795548' },
  { id: 'other', name: 'Other', budgetAmount: 100, currentSpent: 0, color: '#607D8B' },
];

const CATEGORY_COLORS = [
  '#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FF9800', 
  '#795548', '#607D8B', '#E91E63', '#00BCD4', '#8BC34A', '#FFC107'
];

type BudgetPlannerProps = {
  currency?: string;
  userId?: string;
};

const BudgetPlanner = ({ currency = 'INR', userId = '' }: BudgetPlannerProps) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(2300);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editableBudget, setEditableBudget] = useState<BudgetCategory[]>([]);
  const [editableMonthlyBudget, setEditableMonthlyBudget] = useState(2300);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState(0);
  const { data: session } = useSession();
  const { budgets, addBudget } = useBudgets();
  const { transactions } = useTransactions();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Calculate progress percentage safely
  const calculateProgress = (spent: number, budget: number) => {
    if (budget <= 0) return 0;
    const percentage = (spent / budget) * 100;
    return Math.min(percentage, 100);
  };

  // Load budget data and calculate spending
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Load saved budget and monthly budget
        const savedBudget = localStorage.getItem(`budget_${userId}`);
        const savedMonthlyBudget = localStorage.getItem(`monthlyBudget_${userId}`);
        
        let budgetData: BudgetCategory[] = savedBudget 
          ? JSON.parse(savedBudget) 
          : DEFAULT_BUDGET_CATEGORIES;
        
        let monthlyBudgetAmount = savedMonthlyBudget 
          ? parseInt(savedMonthlyBudget) 
          : 2300;
        
        setMonthlyBudget(monthlyBudgetAmount);
        setEditableMonthlyBudget(monthlyBudgetAmount);
        
        // Get transactions for this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthTransactions = transactions.filter(transaction => {
          const txDate = new Date(transaction.date);
          return txDate.getMonth() === currentMonth && 
                 txDate.getFullYear() === currentYear &&
                 transaction.type === 'expense';
        });
        
        // Calculate spending by category
        const spendingByCategory: Record<string, number> = {};
        
        thisMonthTransactions.forEach((transaction: Transaction) => {
          const categoryName = transaction.category;
          if (!spendingByCategory[categoryName]) {
            spendingByCategory[categoryName] = 0;
          }
          spendingByCategory[categoryName] += transaction.amount;
        });
        
        // Create a mapping from category names to budget category IDs
        const categoryNameToId: Record<string, string> = {
          'food': 'food',
          'Food & Dining': 'food',
          'transportation': 'transport',
          'Transportation': 'transport',
          'utilities': 'utilities',
          'Utilities': 'utilities',
          'entertainment': 'entertainment',
          'Entertainment': 'entertainment',
          'health': 'health',
          'healthcare': 'health',
          'Healthcare': 'health',
          'shopping': 'shopping',
          'Shopping': 'shopping',
          'housing': 'housing',
          'Housing': 'housing',
          'other': 'other',
          'Other': 'other'
        };
        
        // Update budget with current spending
        budgetData = budgetData.map(category => {
          let totalSpent = 0;
          
          // Sum up spending for all category names that map to this budget category
          Object.keys(spendingByCategory).forEach(transactionCategory => {
            const mappedId = categoryNameToId[transactionCategory.toLowerCase()] || 
                           categoryNameToId[transactionCategory] ||
                           (transactionCategory.toLowerCase() === category.id ? category.id : null);
            
            if (mappedId === category.id) {
              totalSpent += spendingByCategory[transactionCategory];
            }
          });
          
          return {
            ...category,
            currentSpent: totalSpent
          };
        });
        
        setBudgetCategories(budgetData);
        setEditableBudget(JSON.parse(JSON.stringify(budgetData)));
      } catch (error) {
        console.error('Error loading budget data:', error);
        toast.error('Failed to load budget data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, transactions]);
  
  // Handle budget amount change
  const handleBudgetChange = (categoryId: string, amount: number) => {
    setEditableBudget(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, budgetAmount: amount } 
          : cat
      )
    );
  };

  // Auto-distribute monthly budget
  const autoDistributeBudget = () => {
    const remainingBudget = editableMonthlyBudget;
    const categoriesCount = editableBudget.length;
    const averageAmount = Math.floor(remainingBudget / categoriesCount);
    
    setEditableBudget(prev =>
      prev.map((cat, index) => ({
        ...cat,
        budgetAmount: index === 0 
          ? averageAmount + (remainingBudget % categoriesCount) 
          : averageAmount
      }))
    );
  };

  // Create new category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const newCategory: BudgetCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      budgetAmount: newCategoryAmount,
      currentSpent: 0,
      color: CATEGORY_COLORS[editableBudget.length % CATEGORY_COLORS.length],
      isCustom: true
    };

    setEditableBudget(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryAmount(0);
    setIsNewCategoryOpen(false);
    toast.success('Category created successfully');
  };

  // Delete custom category
  const handleDeleteCategory = (categoryId: string) => {
    setEditableBudget(prev => prev.filter(cat => cat.id !== categoryId));
    toast.success('Category deleted successfully');
  };
  
  // Save updated budget
  const handleSaveBudget = () => {
    if (!userId) return;
    
    try {
      localStorage.setItem(`budget_${userId}`, JSON.stringify(editableBudget));
      localStorage.setItem(`monthlyBudget_${userId}`, editableMonthlyBudget.toString());
      
      setBudgetCategories(editableBudget);
      setMonthlyBudget(editableMonthlyBudget);
      setIsEditing(false);
      toast.success('Budget updated successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditableBudget(JSON.parse(JSON.stringify(budgetCategories)));
    setEditableMonthlyBudget(monthlyBudget);
    setIsEditing(false);
  };
  
  // Calculate totals
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.currentSpent, 0);
  const overallProgress = calculateProgress(totalSpent, totalBudget);
  const totalEditableBudget = editableBudget.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  
  // Prepare chart data
  const chartData = budgetCategories.map(cat => ({
    name: cat.name,
    value: cat.currentSpent,
    color: cat.color,
    budget: cat.budgetAmount
  }));
  
  return (
    <div className="space-y-6">
      {/* Monthly Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span>Monthly Budget Planning</span>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Budget</Button>
            ) : (
              <div className="space-x-2">
                <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
                <Button onClick={handleSaveBudget} className="gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyBudget)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Budget</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(monthlyBudget - totalSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyBudget">Monthly Budget Amount</Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={editableMonthlyBudget}
                    onChange={(e) => setEditableMonthlyBudget(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={autoDistributeBudget} variant="outline" className="w-full">
                    Auto-Distribute Budget
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Allocated: {formatCurrency(totalEditableBudget)} / {formatCurrency(editableMonthlyBudget)}
                {totalEditableBudget !== editableMonthlyBudget && (
                  <span className="text-orange-600 ml-2">
                    (Difference: {formatCurrency(editableMonthlyBudget - totalEditableBudget)})
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Budget Categories</span>
            {isEditing && (
              <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Education, Travel, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryAmount">Budget Amount</Label>
                      <Input
                        id="categoryAmount"
                        type="number"
                        value={newCategoryAmount}
                        onChange={(e) => setNewCategoryAmount(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCategory} className="flex-1">
                        Create Category
                      </Button>
                      <Button 
                        onClick={() => setIsNewCategoryOpen(false)} 
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(isEditing ? editableBudget : budgetCategories).map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                          {category.isCustom && isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(category.currentSpent)} / {formatCurrency(category.budgetAmount)}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="w-28">
                          <Input 
                            type="number"
                            value={category.budgetAmount}
                            onChange={(e) => handleBudgetChange(category.id, Number(e.target.value))}
                            min={0}
                            className="text-right"
                          />
                        </div>
                      ) : (
                        category.currentSpent > category.budgetAmount && (
                          <div className="flex items-center text-red-500 text-sm">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Over budget
                          </div>
                        )
                      )}
                    </div>
                    <Progress value={calculateProgress(category.currentSpent, category.budgetAmount)} />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Overall Budget</span>
                    <span>{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
                  </div>
                  <Progress 
                    value={overallProgress}
                    className={overallProgress > 90 ? "bg-red-100" : ""}
                  />
                  {overallProgress > 90 && (
                    <div className="text-red-500 text-sm flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      You're approaching your overall budget limit
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Spending Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Budget Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetCategories
              .filter(cat => cat.currentSpent > cat.budgetAmount)
              .map(cat => (
                <div key={`alert-${cat.id}`} className="p-4 bg-red-50 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Overspending on {cat.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      You've spent {formatCurrency(cat.currentSpent - cat.budgetAmount)} more than your {formatCurrency(cat.budgetAmount)} budget.
                    </p>
                  </div>
                </div>
              ))}
            
            {budgetCategories.filter(cat => cat.currentSpent > cat.budgetAmount).length === 0 && (
              <div className="p-4 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-700">You're on track with your budget!</h4>
                <p className="text-sm text-muted-foreground">
                  Keep up the good work. You're staying within your budget limits.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPlanner;
