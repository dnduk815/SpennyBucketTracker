import BucketCard from '../BucketCard';

export default function BucketCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <BucketCard
        id="1"
        name="Groceries"
        currentBalance={450.00}
        allocatedAmount={600.00}
        onClick={() => console.log('Groceries bucket clicked')}
      />
      <BucketCard
        id="2"
        name="Transportation"
        currentBalance={75.00}
        allocatedAmount={500.00}
        onClick={() => console.log('Transportation bucket clicked')}
      />
      <BucketCard
        id="3"
        name="Entertainment"
        currentBalance={0}
        allocatedAmount={200.00}
        onClick={() => console.log('Entertainment bucket clicked')}
      />
    </div>
  );
}
