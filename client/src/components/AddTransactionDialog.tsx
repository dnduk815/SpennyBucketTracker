import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bucket {
  id: string;
  name: string;
  currentBalance: number;
}

interface AddTransactionDialogProps {
  buckets: Bucket[];
  onAddTransaction?: (transaction: {
    bucketId: string;
    amount: number;
    description: string;
    date: string;
  }) => void;
}

export default function AddTransactionDialog({ buckets, onAddTransaction }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBucket || !amount) {
      toast({
        title: "Missing information",
        description: "Please select a bucket and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    onAddTransaction?.({
      bucketId: selectedBucket,
      amount: numAmount,
      description: description.trim(),
      date: new Date().toISOString(),
    });

    toast({
      title: "Transaction logged",
      description: `$${numAmount.toFixed(2)} spent from ${buckets.find(b => b.id === selectedBucket)?.name}`,
    });

    setSelectedBucket("");
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" data-testid="button-add-transaction">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-add-transaction">
        <DialogHeader>
          <DialogTitle>Log Spending</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bucket">Spending Bucket</Label>
            <div className="grid grid-cols-2 gap-2">
              {buckets.map((bucket) => (
                <Button
                  key={bucket.id}
                  type="button"
                  variant={selectedBucket === bucket.id ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setSelectedBucket(bucket.id)}
                  data-testid={`button-select-bucket-${bucket.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="text-left w-full">
                    <div className="font-semibold">{bucket.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ${bucket.currentBalance.toFixed(2)} available
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl tabular-nums text-right"
              data-testid="input-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What did you buy?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              data-testid="input-description"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-submit">
              Log Spending
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
