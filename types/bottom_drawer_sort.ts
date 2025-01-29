export const sortTypes = ["Recently added", "A-Z"] as const;

export type BottomDrawerSortOptionProps = {
  key: string;
  order: "asc" | "desc";
};

export type BottomDrawerSortProps = {
  title: string;
  description?: string;
  options: typeof sortTypes;
  selectedSort: BottomDrawerSortOptionProps;
  handleSortOrder: (sort: BottomDrawerSortOptionProps) => void;
};
