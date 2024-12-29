type CalendarModalProps = {
  onClose: () => void;
  onApply: (date: string) => void;
  onClear: () => void;
  defaultDate: string;
};
