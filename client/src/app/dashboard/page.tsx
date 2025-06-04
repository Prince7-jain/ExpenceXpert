'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
} from 'lucide-react';
import { transactionsAPI } from '@/lib/api';
import { Transaction, TransactionSummary } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch summary
        const summaryResponse = await transactionsAPI.getTransactionSummary();
        if (summaryResponse.success && summaryResponse.data) {
          setSummary(summaryResponse.data);
        }

        // Fetch recent transactions
        const transactionsResponse = await transactionsAPI.getTransactions({});
        if (transactionsResponse.success && transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={`skeleton-card-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Transactions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={`skeleton-transaction-${i}`} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your finances today.
            </p>
          </div>
          <Link href="/transactions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary ? formatCurrency(summary.balance) : '₹0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary && summary.balance >= 0 ? '+' : ''}
                {summary ? summary.balance.toFixed(2) : '0.00'} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summary ? formatCurrency(summary.income) : '₹0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary ? summary.incomeCount : 0} transactions this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {summary ? formatCurrency(summary.expense) : '₹0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary ? summary.expenseCount : 0} transactions this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary && summary.income > 0
                  ? `${((summary.balance / summary.income) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Of your income saved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            getTransactionColor(transaction.type)
                          )}
                        >
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none truncate max-w-[150px] sm:max-w-none">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category} • {
                              format(new Date(transaction.date), "MMM dd, yyyy")
                            }
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "font-medium",
                          getTransactionColor(transaction.type)
                        )}
                      >
                        {transaction.type === "expense" && "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent transactions.</p>
                  <p>Start by adding a new transaction to see it here.</p>
                  <Link href="/transactions/new" className="mt-4 inline-block">
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your finances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/transactions/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Transaction
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Transactions
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Categories Overview and Monthly Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categories Overview</CardTitle>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardHeader>
            <CardContent>
              {/* This section would typically display a pie chart or bar chart of categories */}
              {summary && summary.totalTransactions > 0 ? (
                <div className="h-[300px]">Chart Placeholder</div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No categories to display.</p>
                  <p>Add transactions to see your spending breakdown.</p>
                  <Link href="/transactions/new" className="mt-4 inline-block">
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Overview</CardTitle>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="mr-2 h-4 w-4" />
                Select Month
              </Button>
            </CardHeader>
            <CardContent>
              {/* This section would typically display a line chart of monthly trends */}
              {summary && summary.totalTransactions > 0 ? (
                <div className="h-[300px]">Chart Placeholder</div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No monthly data available.</p>
                  <p>Add transactions to see your financial trends over time.</p>
                  <Link href="/transactions/new" className="mt-4 inline-block">
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}