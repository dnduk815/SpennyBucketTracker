import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bucket {
  id: string;
  name: string;
}

interface AllocateFundsDialogProps {
  buckets: Bucket[];
  unallocatedFunds: number;
  onAllocate?: (allocations: Record<string, number>) => void;
}

export default function AllocateFundsDialog({
  buckets,
  unallocatedFunds,
  onAllocate,
}: AllocateFundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initial: Record<string, string> = {};
    buckets.forEach(bucket => {
      initial[bucket.id] = "";
    });
    setAllocations(initial);
  }, [buckets]);

  const getTotalAllocated = () => {
    return Object.values(allocations).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const remaining = unallocatedFunds - getTotalAllocated();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (remaining < 0) {
      toast({
        title: "Over-allocated",
        description: "You're trying to allocate more than available.",
        variant: "destructive",
      });
      return;
    }

    const finalAllocations: Record<string, number> = {};
    Object.entries(allocations).forEach(([id, value]) => {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        finalAllocations[id] = num;
      }
    });

    onAllocate?.(finalAllocations);

    toast({
      title: "Funds allocated",
      description: `$${getTotalAllocated().toFixed(2)} distributed to buckets`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-allocate-funds">
          <Wallet className="w-4 h-4 mr-2" />
          Allocate Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="dialog-allocate-funds">
        <DialogHeader>
          <DialogTitle>Distribute Funds to Buckets</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm text-muted-foreground">Available to allocate</div>
            <div className="text-2xl font-bold tabular-nums" data-testid="text-unallocated-funds">
              ${unallocatedFunds.toFixed(2)}
            </div>
            {getTotalAllocated() > 0 && (
              <div className={`text-sm mt-2 tabular-nums ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`} data-testid="text-remaining">
                ${remaining.toFixed(2)} remaining
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="space-y-1">
                <Label htmlFor={`bucket-${bucket.id}`}>{bucket.name}</Label>
                <Input
                  id={`bucket-${bucket.id}`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={allocations[bucket.id] || ""}
                  onChange={(e) =>
                    setAllocations({ ...allocations, [bucket.id]: e.target.value })
                  }
                  className="tabular-nums"
                  data-testid={`input-allocate-${bucket.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            ))}
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
              Allocate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
