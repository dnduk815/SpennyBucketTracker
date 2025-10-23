import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
  Edit3,
  Trash2,
  Save,
  X,
  ArrowRightLeft,
  LucideIcon,
} from "lucide-react";
import SelectBucketIconDialog, {
  getIconByName,
} from "@/components/SelectBucketIconDialog";
import ReallocateFundsDialog from "@/components/ReallocateFundsDialog";
import { useToast } from "@/hooks/use-toast";

interface Bucket {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconName?: string;
  currentBalance: number;
  allocatedAmount: number;
}

interface BucketManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: Bucket[];
  onUpdateBucket: (
    id: string,
    updates: { name: string; iconName?: string }
  ) => void;
  onDeleteBucket: (id: string) => void;
  onReallocateFunds: (reallocationData: {
    sourceBucketId: string;
    destinationBucketId: string | null;
    amount: string;
    transferType: "balance" | "allocation";
  }) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isReallocating?: boolean;
}

export default function BucketManagementDialog({
  open,
  onOpenChange,
  buckets,
  onUpdateBucket,
  onDeleteBucket,
  onReallocateFunds,
  isUpdating = false,
  isDeleting = false,
  isReallocating = false,
}: BucketManagementDialogProps) {
  const { toast } = useToast();
  const [editingBucketId, setEditingBucketId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIconName, setEditIconName] = useState("");
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [selectedIconForEdit, setSelectedIconForEdit] = useState("");
  const [reallocateDialogOpen, setReallocateDialogOpen] = useState(false);
  const [selectedBucketForReallocation, setSelectedBucketForReallocation] =
    useState<string | null>(null);

  const handleStartEdit = (bucket: Bucket) => {
    setEditingBucketId(bucket.id);
    setEditName(bucket.name);
    setEditIconName(bucket.iconName || "");
    setSelectedIconForEdit(bucket.iconName || "");
  };

  const handleCancelEdit = () => {
    setEditingBucketId(null);
    setEditName("");
    setEditIconName("");
    setSelectedIconForEdit("");
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Bucket name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editingBucketId) {
      onUpdateBucket(editingBucketId, {
        name: editName.trim(),
        iconName: selectedIconForEdit || undefined,
      });
      handleCancelEdit();
    }
  };

  const handleDeleteBucket = (bucketId: string) => {
    onDeleteBucket(bucketId);
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIconForEdit(iconName);
    setEditIconName(iconName);
  };

  const handleReallocateClick = (bucketId: string) => {
    setSelectedBucketForReallocation(bucketId);
    setReallocateDialogOpen(true);
  };

  const handleReallocate = (reallocationData: {
    sourceBucketId: string;
    destinationBucketId: string | null;
    amount: string;
    transferType: "balance" | "allocation";
  }) => {
    onReallocateFunds(reallocationData);
    setReallocateDialogOpen(false);
    setSelectedBucketForReallocation(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Buckets</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {buckets.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No buckets to manage. Create your first bucket to get started!
              </div>
            ) : (
              buckets.map((bucket) => (
                <Card key={bucket.id} className="p-4">
                  {editingBucketId === bucket.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Edit Bucket</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            data-testid={`button-cancel-edit-${bucket.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            data-testid={`button-save-edit-${bucket.id}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdating ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-name-${bucket.id}`}>
                            Bucket Name
                          </Label>
                          <Input
                            id={`edit-name-${bucket.id}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Enter bucket name"
                            data-testid={`input-edit-name-${bucket.id}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Icon (optional)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setIconDialogOpen(true)}
                            data-testid={`button-edit-icon-${bucket.id}`}
                          >
                            {selectedIconForEdit
                              ? `${selectedIconForEdit} icon selected`
                              : "Choose an icon"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bucket.icon && (
                          <bucket.icon className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-semibold">{bucket.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${bucket.currentBalance.toFixed(2)} remaining of $
                            {bucket.allocatedAmount.toFixed(2)} allocated
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(bucket)}
                          data-testid={`button-edit-${bucket.id}`}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReallocateClick(bucket.id)}
                          data-testid={`button-reallocate-${bucket.id}`}
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Reallocate
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-${bucket.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{bucket.name}"?
                                This action cannot be undone. All transactions
                                associated with this bucket will also be
                                deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBucket(bucket.id)}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? "Deleting..." : "Delete Bucket"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SelectBucketIconDialog
        open={iconDialogOpen}
        onOpenChange={setIconDialogOpen}
        onSelect={handleIconSelect}
        currentIcon={selectedIconForEdit}
      />

      <ReallocateFundsDialog
        open={reallocateDialogOpen}
        onOpenChange={setReallocateDialogOpen}
        buckets={buckets}
        preselectedSourceBucketId={selectedBucketForReallocation || undefined}
        onReallocate={handleReallocate}
        isReallocating={isReallocating}
      />
    </>
  );
}
