import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  onAddIncome?: (amount: number, description: string) => void;
}

export default function AddIncomeDialog({ onAddIncome }: AddIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast({
        title: "Missing amount",
        description: "Please enter an income amount.",
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

    onAddIncome?.(numAmount, description.trim());

    toast({
      title: "Income added",
      description: `$${numAmount.toFixed(2)} ready to allocate`,
    });

    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-add-income">
          <DollarSign className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-add-income">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-amount">Amount</Label>
            <Input
              id="income-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl tabular-nums text-right"
              data-testid="input-income-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-description">Source (optional)</Label>
            <Input
              id="income-description"
              placeholder="e.g., Paycheck, Freelance, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-income-description"
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
              Add Income
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
