export interface Review {
  id: string;
  reviewType: ReviewTypeEnum;
  active: boolean;
  icon: string;
}

export enum ReviewTypeEnum {
  OVERALL = 'OVERALL',
  QUALITY = 'QUALITY',
  DURABILITY = 'DURABILITY',
  EASE_OF_USE = 'EASE_OF_USE',
  COMPATIBILITY = 'COMPATIBILITY',
  DESIGN = 'DESIGN',
}
