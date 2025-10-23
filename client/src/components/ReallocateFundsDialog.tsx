import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Bucket {
  id: string;
  name: string;
  icon?: any;
  iconName?: string;
  currentBalance: number;
  allocatedAmount: number;
}

interface ReallocateFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: Bucket[];
  preselectedSourceBucketId?: string;
  onReallocate: (reallocationData: {
    sourceBucketId: string;
    destinationBucketId: string | null;
    amount: string;
    transferType: "balance" | "allocation";
    description?: string;
  }) => void;
  isReallocating?: boolean;
}

export default function ReallocateFundsDialog({
  open,
  onOpenChange,
  buckets,
  preselectedSourceBucketId,
  onReallocate,
  isReallocating = false,
}: ReallocateFundsDialogProps) {
  const { toast } = useToast();
  const [sourceBucketId, setSourceBucketId] = useState("");
  const [destinationBucketId, setDestinationBucketId] = useState<string | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [transferType, setTransferType] = useState<"balance" | "allocation">(
    "balance"
  );
  const [description, setDescription] = useState("");

  // Reset form when dialog opens/closes or preselected bucket changes
  useEffect(() => {
    if (open) {
      setSourceBucketId(preselectedSourceBucketId || "");
      setDestinationBucketId(null);
      setAmount("");
      setTransferType("balance");
      setDescription("");
    }
  }, [open, preselectedSourceBucketId]);

  const sourceBucket = buckets.find((b) => b.id === sourceBucketId);
  const destinationBucket = destinationBucketId
    ? buckets.find((b) => b.id === destinationBucketId)
    : null;

  const availableAmount = sourceBucket
    ? transferType === "balance"
      ? sourceBucket.currentBalance
      : sourceBucket.allocatedAmount
    : 0;

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= availableAmount;
  };

  const canSubmit = () => {
    return (
      sourceBucketId &&
      (destinationBucketId || transferType === "balance") &&
      isValidAmount() &&
      !isReallocating
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit()) {
      toast({
        title: "Invalid input",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
      return;
    }

    onReallocate({
      sourceBucketId,
      destinationBucketId,
      amount,
      transferType,
      description,
    });

    // Reset form
    setAmount("");
  };

  const handleDestinationChange = (value: string) => {
    setDestinationBucketId(value === "unallocated" ? null : value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-reallocate-funds">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Reallocate Funds
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Bucket Selection */}
          <div className="space-y-2">
            <Label htmlFor="source-bucket">From Bucket</Label>
            <Select value={sourceBucketId} onValueChange={setSourceBucketId}>
              <SelectTrigger id="source-bucket">
                <SelectValue placeholder="Select source bucket" />
              </SelectTrigger>
              <SelectContent>
                {buckets.map((bucket) => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    <div className="flex items-center gap-2">
                      {bucket.icon && <bucket.icon className="w-4 h-4" />}
                      <span>{bucket.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Bucket Info */}
          {sourceBucket && (
            <Card className="p-3 bg-muted">
              <div className="text-sm text-muted-foreground">
                Available funds
              </div>
              <div className="text-lg font-semibold">
                ${availableAmount.toFixed(2)}{" "}
                {transferType === "balance" ? "remaining" : "allocated"}
              </div>
              <div className="text-xs text-muted-foreground">
                Total allocated: ${sourceBucket.allocatedAmount.toFixed(2)}
              </div>
            </Card>
          )}

          {/* Transfer Type Selection */}
          <div className="space-y-3">
            <Label>Transfer Type</Label>
            <RadioGroup
              value={transferType}
              onValueChange={(value) =>
                setTransferType(value as "balance" | "allocation")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance" className="flex items-center gap-2">
                  Move Balance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Move remaining money only. When moving to
                          "Unallocated", reduces both balance and allocation to
                          free up funds.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="allocation" id="allocation" />
                <Label htmlFor="allocation" className="flex items-center gap-2">
                  Move Allocation
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Move both allocated amount and remaining balance.
                          Essentially re-budgeting funds between buckets.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Destination Selection */}
          <div className="space-y-2">
            <Label htmlFor="destination-bucket">To Bucket</Label>
            <Select
              value={destinationBucketId || "unallocated"}
              onValueChange={handleDestinationChange}
            >
              <SelectTrigger id="destination-bucket">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unallocated">Unallocated</SelectItem>
                {buckets
                  .filter((bucket) => bucket.id !== sourceBucketId)
                  .map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      <div className="flex items-center gap-2">
                        {bucket.icon && <bucket.icon className="w-4 h-4" />}
                        <span>{bucket.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg tabular-nums text-right"
              data-testid="input-reallocate-amount"
            />
            {amount && !isValidAmount() && (
              <div className="text-sm text-destructive">
                Amount must be between $0.01 and ${availableAmount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Moving funds for emergency"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-description"
            />
          </div>

          {/* Preview */}
          {sourceBucket && destinationBucket && amount && isValidAmount() && (
            <Card className="p-3 bg-blue-50 dark:bg-blue-950">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Transfer Preview
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {transferType === "balance"
                  ? "Moving balance"
                  : "Moving allocation"}{" "}
                of ${parseFloat(amount).toFixed(2)} from {sourceBucket.name} to{" "}
                {destinationBucket.name}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit()}
              className="flex-1"
              data-testid="button-submit"
            >
              {isReallocating ? "Reallocating..." : "Reallocate Funds"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
