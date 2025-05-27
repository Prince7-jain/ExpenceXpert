
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '@/lib/types';

type MonthlyBarChartProps = {
  data: MonthlyData[];
  className?: string;
  currency?: string;
};

const MonthlyBarChart = ({ data, className, currency = 'USD' }: MonthlyBarChartProps) => {
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${getCurrencySymbol(currency)}${(value / 1000).toFixed(1)}k`;
    }
    return `${getCurrencySymbol(currency)}${value}`;
  };

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  // Get currency symbol for short formatting
  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'Fr',
      'CNY': '¥',
      'NZD': 'NZ$'
    };
    
    return symbols[currencyCode] || currencyCode;
  };

  // Format month labels
  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    } catch (e) {
      return monthStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{formatMonthLabel(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonthLabel}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
