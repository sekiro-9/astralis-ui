import { DataListRoot } from "./components/data-list-root";
import { DataListItem } from "./components/data-list-item";
import { DataListLabel } from "./components/data-list-label";
import { DataListValue } from "./components/data-list-value";

export const DataList = Object.assign(DataListRoot, {
  Item: DataListItem,
  Label: DataListLabel,
  Value: DataListValue,
});

export {
  DataListItem,
  DataListLabel,
  DataListValue,
};

export type {
  DataListProps,
  DataListItemProps,
  DataListLabelProps,
  DataListValueProps,
} from "./data-list.types";
