
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { getFinancialGoals, addFinancialGoal, updateFinancialGoal } from '@/lib/extendedFinanceService';
import { FinancialGoal } from '@/lib/types';
import { toast } from 'sonner';

const FinancialGoals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      loadGoals();
    }
  }, [session?.user]);

  const loadGoals = async () => {
    if (!session?.user?.id) return;
    try {
      const userGoals = await getFinancialGoals(session.user.id);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      const goalData = {
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        targetDate: newGoal.targetDate,
        description: newGoal.description,
        isCompleted: false
      };

      await addFinancialGoal(session.user.id, goalData);
      await loadGoals();
      setIsDialogOpen(false);
      setNewGoal({ title: '', targetAmount: '', targetDate: '', description: '' });
      toast.success('Financial goal added successfully!');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add financial goal');
    }
  };

  const handleProgressUpdate = async (goalId: string, amount: number) => {
    if (!session?.user?.id) return;
    
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = goal.currentAmount + amount;
      const isCompleted = newCurrentAmount >= goal.targetAmount;

      await updateFinancialGoal(session.user.id, goalId, {
        currentAmount: newCurrentAmount,
        isCompleted
      });

      await loadGoals();
      toast.success('Goal progress updated!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Financial Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Target Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="100000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Target Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                />
              </div>
              <Button type="submit" className="w-full">Create Goal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={goal.id} className={goal.isCompleted ? 'border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {goal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                    <span>₹{goal.currentAmount.toLocaleString()}</span>
                    <span>₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </div>

                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}

                {!goal.isCompleted && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProgressUpdate(goal.id, 1000)}
                    >
                      +₹1K
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProgressUpdate(goal.id, 5000)}
                    >
                      +₹5K
                    </Button>
                  </div>
                )}

                {goal.isCompleted && (
                  <div className="text-green-600 font-medium">🎉 Goal Completed!</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Financial Goals Yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start by setting your first financial goal to track your progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialGoals;
