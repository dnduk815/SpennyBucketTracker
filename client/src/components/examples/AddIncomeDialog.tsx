import AddIncomeDialog from '../AddIncomeDialog';

export default function AddIncomeDialogExample() {
  return (
    <AddIncomeDialog
      onAddIncome={(amount, description) => console.log('Income added:', amount, description)}
    />
  );
}
