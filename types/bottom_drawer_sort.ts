export const sortTypes = ["Recently added", "Recently updated", "A-Z"] as const;

export type SortType = (typeof sortTypes)[number];

export type BottomDrawerSortOptionProps = {
  key: string;
  order: "asc" | "desc";
};

export type BottomDrawerSortProps = {
  title: string;
  description?: string;
  options: readonly SortType[];
  selectedSort: BottomDrawerSortOptionProps;
  handleSortOrder: (sort: BottomDrawerSortOptionProps) => void;
};
