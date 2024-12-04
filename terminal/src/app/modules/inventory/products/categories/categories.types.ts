import { CatalogueCategoryType } from '@sifca-monorepo/terminal-generator';

export interface ICatalogueCategoryTreeType extends CatalogueCategoryType {
  selected?: boolean;
  children?: ICatalogueCategoryTreeType[];
}
