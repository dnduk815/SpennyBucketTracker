import TransactionList from '../TransactionList';

export default function TransactionListExample() {
  const mockBuckets = [
    { id: "1", name: "Groceries" },
    { id: "2", name: "Transportation" },
    { id: "3", name: "Entertainment" },
  ];

  const mockTransactions = [
    {
      id: "1",
      bucketId: "1",
      bucketName: "Groceries",
      amount: 45.23,
      description: "Whole Foods",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      bucketId: "2",
      bucketName: "Transportation",
      amount: 25.00,
      description: "Gas station",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      bucketId: "1",
      bucketName: "Groceries",
      amount: 12.50,
      description: "Corner store",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "4",
      bucketId: "3",
      bucketName: "Entertainment",
      amount: 50.00,
      description: "Movie tickets",
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return (
    <div className="max-w-2xl p-4">
      <TransactionList transactions={mockTransactions} buckets={mockBuckets} />
    </div>
  );
}
