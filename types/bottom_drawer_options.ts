type BottomDrawerOptionProps = {
  key: string;
  label: string;
  icon?: string;
};

type BottomDrawerOptionsProps = {
  title: string;
  description?: string;
  options: BottomDrawerOptionProps[];
  selectedOption: string;
  handleSelectOption: (option: string) => void;
};
