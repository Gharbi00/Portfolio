import { CatalogueCategoryType } from '@sifca-monorepo/terminal-generator';

export interface ICatalogueCategoryTreeType extends CatalogueCategoryType {
  selected?: boolean;
  children?: ICatalogueCategoryTreeType[];
}

export enum SortingFieldName {
  name = 'name',
  price = 'price',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}
export type SortingField = {
  [fields in SortingFieldName]?: 1 | -1;
};
