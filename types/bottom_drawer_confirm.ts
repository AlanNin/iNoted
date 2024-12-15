export type BottomDrawerConfirmProps = {
  title: string;
  description: string;
  submitButtonText: string;
  onSubmit: () => void;
  onCancel?: () => void;
};
