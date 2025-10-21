import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Car, 
  Film, 
  Utensils, 
  Home, 
  Heart, 
  Plane, 
  Book,
  Coffee,
  Shirt,
  Dumbbell,
  Stethoscope,
  Briefcase,
  Gift,
  Laptop,
  Phone,
  type LucideIcon
} from "lucide-react";

const availableIcons: { icon: LucideIcon; name: string }[] = [
  { icon: ShoppingCart, name: "Shopping" },
  { icon: Car, name: "Transportation" },
  { icon: Film, name: "Entertainment" },
  { icon: Utensils, name: "Dining" },
  { icon: Home, name: "Home" },
  { icon: Heart, name: "Health" },
  { icon: Plane, name: "Travel" },
  { icon: Book, name: "Education" },
  { icon: Coffee, name: "Coffee" },
  { icon: Shirt, name: "Clothing" },
  { icon: Dumbbell, name: "Fitness" },
  { icon: Stethoscope, name: "Medical" },
  { icon: Briefcase, name: "Work" },
  { icon: Gift, name: "Gifts" },
  { icon: Laptop, name: "Tech" },
  { icon: Phone, name: "Mobile" },
];

interface SelectBucketIconDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

export default function SelectBucketIconDialog({
  open,
  onOpenChange,
  onSelect,
  currentIcon,
}: SelectBucketIconDialogProps) {
  const [selected, setSelected] = useState(currentIcon || "");

  const handleSelect = () => {
    onSelect(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-select-icon">
        <DialogHeader>
          <DialogTitle>Choose Bucket Icon</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {availableIcons.map(({ icon: Icon, name }) => (
            <Button
              key={name}
              variant={selected === name ? "default" : "outline"}
              className="h-16 flex flex-col gap-1"
              onClick={() => setSelected(name)}
              data-testid={`button-icon-${name.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{name}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleSelect} className="flex-1" data-testid="button-submit">
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getIconByName(name: string): LucideIcon | undefined {
  return availableIcons.find(i => i.name === name)?.icon;
}
