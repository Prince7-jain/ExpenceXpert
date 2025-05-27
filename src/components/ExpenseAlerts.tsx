
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getExpenseAlerts, markAlertAsRead, generateSmartAlerts } from '@/lib/extendedFinanceService';
import { getTransactions } from '@/lib/transactionService';
import { ExpenseAlert } from '@/lib/types';

const ExpenseAlerts = () => {
  const [alerts, setAlerts] = useState<ExpenseAlert[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      loadAlerts();
    }
  }, [session?.user]);

  const loadAlerts = async () => {
    if (!session?.user?.id) return;
    try {
      // Get existing alerts
      const existingAlerts = await getExpenseAlerts(session.user.id);
      
      // Generate new smart alerts
      const transactions = await getTransactions(session.user.id);
      const smartAlerts = await generateSmartAlerts(session.user.id, transactions);
      
      // Combine and deduplicate
      const allAlerts = [...existingAlerts, ...smartAlerts];
      const uniqueAlerts = allAlerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.message === alert.message)
      );
      
      setAlerts(uniqueAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    if (!session?.user?.id) return;
    
    try {
      await markAlertAsRead(session.user.id, alertId);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getAlertIcon = (type: string, priority: string) => {
    if (type === 'budget_limit' || priority === 'high') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (type === 'unusual_spending') {
      return <TrendingUp className="h-5 w-5 text-orange-500" />;
    }
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const readAlerts = alerts.filter(alert => alert.isRead);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Alerts</h2>
        {unreadAlerts.length > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {unreadAlerts.length} new alert{unreadAlerts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              New Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.priority)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type, alert.priority)}
                      <AlertDescription className="font-medium">
                        {alert.message}
                      </AlertDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {readAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                  {getAlertIcon(alert.type, alert.priority)}
                  <div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Alerts</h3>
            <p className="text-sm text-muted-foreground text-center">
              You'll see smart alerts here when we detect unusual spending patterns or budget limits
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseAlerts;
