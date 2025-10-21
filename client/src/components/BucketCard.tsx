import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface BucketCardProps {
  id: string;
  name: string;
  currentBalance: number;
  allocatedAmount: number;
  onClick?: () => void;
}

export default function BucketCard({
  name,
  currentBalance,
  allocatedAmount,
  onClick,
}: BucketCardProps) {
  const percentageRemaining = allocatedAmount > 0 
    ? (currentBalance / allocatedAmount) * 100 
    : 0;
  
  const isLow = percentageRemaining < 20 && percentageRemaining > 0;
  const isDepleted = currentBalance <= 0;
  
  const getStatusColor = () => {
    if (isDepleted) return "text-destructive";
    if (isLow) return "text-warning";
    return "text-success";
  };
  
  const getProgressColor = () => {
    if (isDepleted) return "bg-destructive";
    if (isLow) return "bg-warning";
    return "bg-success";
  };

  return (
    <Card 
      className="p-6 hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-bucket-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold" data-testid="text-bucket-name">{name}</h3>
          {(isLow || isDepleted) && (
            <AlertCircle className={`w-5 h-5 ${getStatusColor()}`} data-testid="icon-status-alert" />
          )}
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${getStatusColor()}`} data-testid="text-current-balance">
            ${currentBalance.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mt-1" data-testid="text-allocated-amount">
            of ${allocatedAmount.toFixed(2)} allocated
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={percentageRemaining} 
            className="h-2"
            indicatorClassName={getProgressColor()}
            data-testid="progress-bucket-balance"
          />
          <div className="text-xs text-muted-foreground text-right" data-testid="text-percentage-remaining">
            {percentageRemaining.toFixed(0)}% remaining
          </div>
        </div>
      </div>
    </Card>
  );
}
