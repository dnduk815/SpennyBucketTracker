import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RemoveFundsDialogProps {
  unallocatedFunds: number;
  onRemoveFunds?: (amount: number, reason: string) => void;
}

export default function RemoveFundsDialog({
  unallocatedFunds,
  onRemoveFunds,
}: RemoveFundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast({
        title: "Missing amount",
        description: "Please enter an amount to remove.",
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

    if (numAmount > unallocatedFunds) {
      toast({
        title: "Insufficient funds",
        description: "Cannot remove more than available unallocated funds.",
        variant: "destructive",
      });
      return;
    }

    onRemoveFunds?.(numAmount, reason.trim());

    setAmount("");
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-remove-funds">
          <MinusCircle className="w-4 h-4 mr-2" />
          Remove Funds
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-remove-funds">
        <DialogHeader>
          <DialogTitle>Remove Unallocated Funds</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm text-muted-foreground">
              Available unallocated
            </div>
            <div
              className="text-2xl font-bold tabular-nums"
              data-testid="text-available-funds"
            >
              ${unallocatedFunds.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remove-amount">Amount to Remove</Label>
            <Input
              id="remove-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl tabular-nums text-right"
              data-testid="input-remove-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remove-reason">Reason (optional)</Label>
            <Textarea
              id="remove-reason"
              placeholder="e.g., Emergency expense, Transfer to savings, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              data-testid="input-remove-reason"
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
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              data-testid="button-submit"
            >
              Remove Funds
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
