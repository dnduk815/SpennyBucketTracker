import AddTransactionDialog from '../AddTransactionDialog';

export default function AddTransactionDialogExample() {
  const mockBuckets = [
    { id: "1", name: "Groceries", currentBalance: 450.00 },
    { id: "2", name: "Transportation", currentBalance: 75.00 },
    { id: "3", name: "Entertainment", currentBalance: 200.00 },
    { id: "4", name: "Dining Out", currentBalance: 150.00 },
  ];

  return (
    <AddTransactionDialog
      buckets={mockBuckets}
      onAddTransaction={(transaction) => console.log('Transaction added:', transaction)}
    />
  );
}
