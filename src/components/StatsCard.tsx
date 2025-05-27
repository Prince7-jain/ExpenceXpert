
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  className?: string;
};

const StatsCard = ({ title, value, description, icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
            {trend && (
              <span className={cn(
                "ml-1",
                trend.positive ? "text-green-500" : "text-red-500"
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
