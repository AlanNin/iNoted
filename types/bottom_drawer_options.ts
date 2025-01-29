type BottomDrawerOptionProps = {
  name: "list" | "grid";
  icon?: string;
};

type BottomDrawerOptionsProps = {
  title: string;
  description?: string;
  options: BottomDrawerOptionProps[];
  selectedOption: string;
  handleSelectOption: (option: string) => void;
};
