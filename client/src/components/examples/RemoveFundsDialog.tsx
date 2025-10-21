import RemoveFundsDialog from '../RemoveFundsDialog';

export default function RemoveFundsDialogExample() {
  return (
    <RemoveFundsDialog
      unallocatedFunds={500.00}
      onRemoveFunds={(amount, reason) => console.log('Funds removed:', amount, reason)}
    />
  );
}
