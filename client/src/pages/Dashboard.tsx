import { useState } from "react";
import BucketCard from "@/components/BucketCard";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import AddIncomeDialog from "@/components/AddIncomeDialog";
import AllocateFundsDialog from "@/components/AllocateFundsDialog";
import TransactionList from "@/components/TransactionList";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Bucket {
  id: string;
  name: string;
  currentBalance: number;
  allocatedAmount: number;
}

interface Transaction {
  id: string;
  bucketId: string;
  bucketName: string;
  amount: number;
  description: string;
  date: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  
  const [buckets, setBuckets] = useState<Bucket[]>([
    { id: "1", name: "Groceries", currentBalance: 450.00, allocatedAmount: 600.00 },
    { id: "2", name: "Transportation", currentBalance: 75.00, allocatedAmount: 500.00 },
    { id: "3", name: "Entertainment", currentBalance: 200.00, allocatedAmount: 200.00 },
    { id: "4", name: "Dining Out", currentBalance: 150.00, allocatedAmount: 300.00 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      bucketId: "1",
      bucketName: "Groceries",
      amount: 45.23,
      description: "Whole Foods",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      bucketId: "2",
      bucketName: "Transportation",
      amount: 25.00,
      description: "Gas station",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [unallocatedFunds, setUnallocatedFunds] = useState(500.00);
  const [newBucketName, setNewBucketName] = useState("");
  const [newBucketDialogOpen, setNewBucketDialogOpen] = useState(false);

  const totalAllocated = buckets.reduce((sum, bucket) => sum + bucket.allocatedAmount, 0);
  const totalRemaining = buckets.reduce((sum, bucket) => sum + bucket.currentBalance, 0);
  const totalSpent = totalAllocated - totalRemaining;

  const handleAddTransaction = (transaction: {
    bucketId: string;
    amount: number;
    description: string;
    date: string;
  }) => {
    const bucket = buckets.find(b => b.id === transaction.bucketId);
    if (!bucket) return;

    setBuckets(buckets.map(b =>
      b.id === transaction.bucketId
        ? { ...b, currentBalance: Math.max(0, b.currentBalance - transaction.amount) }
        : b
    ));

    setTransactions([
      {
        id: Date.now().toString(),
        bucketId: transaction.bucketId,
        bucketName: bucket.name,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      },
      ...transactions,
    ]);
  };

  const handleAddIncome = (amount: number, description: string) => {
    setUnallocatedFunds(unallocatedFunds + amount);
  };

  const handleAllocate = (allocations: Record<string, number>) => {
    const totalAllocating = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    
    setBuckets(buckets.map(bucket => {
      const allocation = allocations[bucket.id] || 0;
      return {
        ...bucket,
        allocatedAmount: bucket.allocatedAmount + allocation,
        currentBalance: bucket.currentBalance + allocation,
      };
    }));

    setUnallocatedFunds(unallocatedFunds - totalAllocating);
  };

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    const newBucket: Bucket = {
      id: Date.now().toString(),
      name: newBucketName.trim(),
      currentBalance: 0,
      allocatedAmount: 0,
    };

    setBuckets([...buckets, newBucket]);
    setNewBucketName("");
    setNewBucketDialogOpen(false);
    
    toast({
      title: "Bucket created",
      description: `${newBucketName} is ready for allocation`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-app-title">Spenny</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <div className="flex gap-2 flex-wrap">
              <AddIncomeDialog onAddIncome={handleAddIncome} />
              <AllocateFundsDialog
                buckets={buckets}
                unallocatedFunds={unallocatedFunds}
                onAllocate={handleAllocate}
              />
              <AddTransactionDialog
                buckets={buckets}
                onAddTransaction={handleAddTransaction}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Allocated</div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-total-allocated">
                ${totalAllocated.toFixed(2)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Remaining</div>
              <div className="text-2xl font-bold tabular-nums text-success" data-testid="text-total-remaining">
                ${totalRemaining.toFixed(2)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-total-spent">
                ${totalSpent.toFixed(2)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Unallocated</div>
              <div className="text-2xl font-bold tabular-nums text-warning" data-testid="text-unallocated">
                ${unallocatedFunds.toFixed(2)}
              </div>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Spending Buckets</h3>
            <Dialog open={newBucketDialogOpen} onOpenChange={setNewBucketDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-add-bucket">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bucket
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-add-bucket">
                <DialogHeader>
                  <DialogTitle>Create New Bucket</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBucket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bucket-name">Bucket Name</Label>
                    <Input
                      id="bucket-name"
                      placeholder="e.g., Healthcare, Shopping, etc."
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      data-testid="input-bucket-name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewBucketDialogOpen(false)}
                      className="flex-1"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" data-testid="button-submit">
                      Create Bucket
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                {...bucket}
                onClick={() => console.log(`Clicked ${bucket.name}`)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
          <TransactionList transactions={transactions} buckets={buckets} />
        </section>
      </main>
    </div>
  );
}
