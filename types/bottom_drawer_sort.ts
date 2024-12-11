type BottomDrawerSortActionsProps = {
  title: string;
  action: () => void;
  order?: "asc" | "desc";
  isSelected?: boolean;
};

export type BottomDrawerSortProps = {
  title: string;
  description?: string;
  actions: BottomDrawerSortActionsProps[];
};
