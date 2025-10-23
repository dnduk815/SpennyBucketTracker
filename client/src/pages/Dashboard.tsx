import { useState } from "react";
import BucketCard from "@/components/BucketCard";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import AddIncomeDialog from "@/components/AddIncomeDialog";
import AllocateFundsDialog from "@/components/AllocateFundsDialog";
import RemoveFundsDialog from "@/components/RemoveFundsDialog";
import TransactionList from "@/components/TransactionList";
import AllocationHistoryList from "@/components/AllocationHistoryList";
import IncomeHistoryList from "@/components/IncomeHistoryList";
import AllActivitiesList from "@/components/AllActivitiesList";
import ThemeToggle from "@/components/ThemeToggle";
import SelectBucketIconDialog, {
  getIconByName,
} from "@/components/SelectBucketIconDialog";
import BucketManagementDialog from "@/components/BucketManagementDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  Wallet,
  Settings,
  ShoppingCart,
  Car,
  Film,
  Utensils,
  Edit3,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useBuckets } from "@/hooks/api/useBuckets";
import { useTransactions } from "@/hooks/api/useTransactions";
import { useIncome } from "@/hooks/api/useIncome";
import { useAllocations } from "@/hooks/api/useAllocations";

interface Bucket {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconName?: string;
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
  const [, setLocation] = useLocation();

  // Use API hooks to fetch real data
  const {
    buckets: apiBuckets,
    isLoading: bucketsLoading,
    createBucket,
    updateBucket,
    deleteBucket,
    reallocateFunds,
    allocateFunds,
    isUpdating,
    isDeleting,
    isReallocating,
    isAllocating,
  } = useBuckets();
  const {
    transactions: apiTransactions,
    isLoading: transactionsLoading,
    createTransaction,
  } = useTransactions({ limit: 100 });
  const {
    incomeRecords,
    isLoading: incomeLoading,
    createIncome,
    deleteIncome,
  } = useIncome();
  const { data: allocationHistory, isLoading: allocationsLoading } =
    useAllocations({ limit: 100 });
  const [newBucketName, setNewBucketName] = useState("");
  const [newBucketDialogOpen, setNewBucketDialogOpen] = useState(false);
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [selectedIconForNewBucket, setSelectedIconForNewBucket] = useState("");
  const [manageBucketsDialogOpen, setManageBucketsDialogOpen] = useState(false);

  // Pagination state for each tab
  const [allActivitiesPage, setAllActivitiesPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [allocationsPage, setAllocationsPage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);

  // Transform API data to match component interface
  const buckets = apiBuckets.map((bucket) => ({
    id: bucket.id,
    name: bucket.name,
    icon: getIconByName(bucket.iconName || ""),
    iconName: bucket.iconName || "",
    currentBalance: parseFloat(bucket.currentBalance),
    allocatedAmount: parseFloat(bucket.allocatedAmount),
  }));

  const transactions = apiTransactions.map((transaction) => ({
    id: transaction.id,
    bucketId: transaction.bucketId,
    bucketName:
      buckets.find((b) => b.id === transaction.bucketId)?.name || "Unknown",
    amount: parseFloat(transaction.amount),
    description: transaction.description || "",
    date:
      typeof transaction.date === "string"
        ? transaction.date
        : transaction.date && typeof transaction.date.toISOString === "function"
        ? transaction.date.toISOString()
        : new Date().toISOString(),
  }));

  // Calculate totals from real data
  const totalIncome = incomeRecords.reduce(
    (sum, record) => sum + parseFloat(record.amount),
    0
  );
  const totalAllocated = buckets.reduce(
    (sum, bucket) => sum + bucket.allocatedAmount,
    0
  );
  const totalRemaining = buckets.reduce(
    (sum, bucket) => sum + bucket.currentBalance,
    0
  );
  const totalSpent = totalAllocated - totalRemaining;
  const unallocatedFunds = totalIncome - totalAllocated;

  const handleAddTransaction = (transaction: {
    bucketId: string;
    amount: number;
    description: string;
    date: string;
  }) => {
    const transactionData = {
      bucketId: transaction.bucketId,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date, // Keep as string, let server handle it
    };

    createTransaction(transactionData);
  };

  const handleAddIncome = (amount: number, description: string) => {
    createIncome({
      amount: amount.toString(),
      description: description,
    });
  };

  const handleRemoveFunds = (amount: number, reason: string) => {
    // Check if we have enough unallocated funds
    if (amount > unallocatedFunds) {
      toast({
        title: "Insufficient funds",
        description: `Cannot remove $${amount.toFixed(
          2
        )}. Only $${unallocatedFunds.toFixed(2)} available.`,
        variant: "destructive",
      });
      return;
    }

    // Create a negative income record to reduce total income
    createIncome({
      amount: (-amount).toString(), // Negative amount
      description: reason || "Funds removed",
    });
  };

  const handleAllocateFunds = (
    allocations: Record<string, number>,
    description?: string
  ) => {
    // Convert numbers to strings for API
    const allocationsAsStrings = Object.fromEntries(
      Object.entries(allocations).map(([bucketId, amount]) => [
        bucketId,
        amount.toString(),
      ])
    );

    allocateFunds({
      allocations: allocationsAsStrings,
      description: description || undefined,
    });
  };

  // Loading state
  const isLoading =
    bucketsLoading ||
    transactionsLoading ||
    incomeLoading ||
    allocationsLoading;

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    createBucket({
      name: newBucketName.trim(),
      iconName: selectedIconForNewBucket || null,
      allocatedAmount: "0",
      currentBalance: "0",
    });

    setNewBucketName("");
    setSelectedIconForNewBucket("");
    setNewBucketDialogOpen(false);
  };

  const handleUpdateBucket = (
    id: string,
    updates: { name: string; iconName?: string }
  ) => {
    updateBucket({ id, updates });
  };

  const handleDeleteBucket = (id: string) => {
    deleteBucket(id);
  };

  const handleReallocateFunds = (reallocationData: {
    sourceBucketId: string;
    destinationBucketId: string | null;
    amount: string;
    transferType: "balance" | "allocation";
    description?: string;
  }) => {
    reallocateFunds(reallocationData);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-app-title">
              Spenny
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <div className="flex gap-2 flex-wrap">
              <AddIncomeDialog onAddIncome={handleAddIncome} />
              <RemoveFundsDialog
                unallocatedFunds={unallocatedFunds}
                onRemoveFunds={handleRemoveFunds}
              />
              <AllocateFundsDialog
                buckets={buckets}
                unallocatedFunds={unallocatedFunds}
                onAllocate={handleAllocateFunds}
              />
              <AddTransactionDialog
                buckets={buckets}
                onAddTransaction={handleAddTransaction}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Income</div>
              <div
                className="text-2xl font-bold tabular-nums"
                data-testid="text-total-income"
              >
                {isLoading ? "..." : `$${totalIncome.toFixed(2)}`}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                Total Allocated
              </div>
              <div
                className="text-2xl font-bold tabular-nums"
                data-testid="text-total-allocated"
              >
                {isLoading ? "..." : `$${totalAllocated.toFixed(2)}`}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                Total Remaining
              </div>
              <div
                className="text-2xl font-bold tabular-nums text-success"
                data-testid="text-total-remaining"
              >
                {isLoading ? "..." : `$${totalRemaining.toFixed(2)}`}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div
                className="text-2xl font-bold tabular-nums"
                data-testid="text-total-spent"
              >
                {isLoading ? "..." : `$${totalSpent.toFixed(2)}`}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Unallocated</div>
              <div
                className="text-2xl font-bold tabular-nums text-warning"
                data-testid="text-unallocated"
              >
                {isLoading ? "..." : `$${unallocatedFunds.toFixed(2)}`}
              </div>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Spending Buckets</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageBucketsDialogOpen(true)}
                data-testid="button-manage-buckets"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Manage Buckets
              </Button>
              <Dialog
                open={newBucketDialogOpen}
                onOpenChange={setNewBucketDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-add-bucket"
                  >
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

                    <div className="space-y-2">
                      <Label>Icon (optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setIconDialogOpen(true)}
                        data-testid="button-select-icon"
                      >
                        {selectedIconForNewBucket
                          ? `${selectedIconForNewBucket} icon selected`
                          : "Choose an icon"}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewBucketDialogOpen(false);
                          setSelectedIconForNewBucket("");
                        }}
                        className="flex-1"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        data-testid="button-submit"
                      >
                        Create Bucket
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Loading buckets...
              </div>
            ) : buckets.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No buckets yet. Create your first bucket to get started!
              </div>
            ) : (
              buckets.map((bucket) => (
                <BucketCard
                  key={bucket.id}
                  {...bucket}
                  onClick={() => console.log(`Clicked ${bucket.name}`)}
                />
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Activity History</h3>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading activity history...
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All Activities</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="allocations">Allocations</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {transactions.length === 0 &&
                (!allocationHistory || allocationHistory.length === 0) &&
                incomeRecords.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No activities yet. Add transactions, allocate funds, or
                    record income to get started!
                  </div>
                ) : (
                  <AllActivitiesList
                    transactions={transactions}
                    allocations={allocationHistory || []}
                    incomeRecords={incomeRecords}
                    currentPage={allActivitiesPage}
                    onPageChange={setAllActivitiesPage}
                    itemsPerPage={10}
                  />
                )}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4 mt-4">
                {transactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions yet. Add your first transaction to get
                    started!
                  </div>
                ) : (
                  <TransactionList
                    transactions={transactions}
                    currentPage={transactionsPage}
                    onPageChange={setTransactionsPage}
                    itemsPerPage={10}
                  />
                )}
              </TabsContent>

              <TabsContent value="allocations" className="space-y-4 mt-4">
                {!allocationHistory || allocationHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No allocation history yet. Allocate funds to buckets to see
                    history!
                  </div>
                ) : (
                  <AllocationHistoryList
                    allocations={allocationHistory}
                    currentPage={allocationsPage}
                    onPageChange={setAllocationsPage}
                    itemsPerPage={10}
                  />
                )}
              </TabsContent>

              <TabsContent value="income" className="space-y-4 mt-4">
                {incomeRecords.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No income history yet. Add income or remove funds to see
                    history!
                  </div>
                ) : (
                  <IncomeHistoryList
                    incomeRecords={incomeRecords}
                    currentPage={incomePage}
                    onPageChange={setIncomePage}
                    itemsPerPage={10}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </section>
      </main>

      <SelectBucketIconDialog
        open={iconDialogOpen}
        onOpenChange={setIconDialogOpen}
        onSelect={setSelectedIconForNewBucket}
        currentIcon={selectedIconForNewBucket}
      />

      <BucketManagementDialog
        open={manageBucketsDialogOpen}
        onOpenChange={setManageBucketsDialogOpen}
        buckets={buckets}
        onUpdateBucket={handleUpdateBucket}
        onDeleteBucket={handleDeleteBucket}
        onReallocateFunds={handleReallocateFunds}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isReallocating={isReallocating}
      />
    </div>
  );
}
