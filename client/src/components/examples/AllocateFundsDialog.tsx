import AllocateFundsDialog from '../AllocateFundsDialog';

export default function AllocateFundsDialogExample() {
  const mockBuckets = [
    { id: "1", name: "Groceries" },
    { id: "2", name: "Transportation" },
    { id: "3", name: "Entertainment" },
    { id: "4", name: "Dining Out" },
  ];

  return (
    <AllocateFundsDialog
      buckets={mockBuckets}
      unallocatedFunds={1500.00}
      onAllocate={(allocations) => console.log('Funds allocated:', allocations)}
    />
  );
}
