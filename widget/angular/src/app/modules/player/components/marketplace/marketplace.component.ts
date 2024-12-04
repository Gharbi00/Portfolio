import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { find, forEach } from 'lodash';
import { ChangeContext, LabelType, Options } from '@angular-slider/ngx-slider';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  InternalProductFilterType,
  InternalProductWithRatingsWithFavoriteStatusType,
  PictureType,
  WidgetVisualsType,
} from '@sifca-monorepo/widget-generator';
import { PlayerService } from '../../player.service';
import { IPagination } from '@diktup/frontend/models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      :host {
        display: contents;
      }
      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }
      .rtl .form-input-decorated input[type='text'] {
        padding-right: 0px !important;
      }
      .rtl .form-input-decorated .form-input-icon {
        right: auto !important;
        left: 20px !important;
        transform: scaleX(-1);
      }
      .pl-0 {
        padding-left: 0px;
      }
      .pr-0 {
        padding-right: 0px;
      }
      @media (min-width: 992px) {
        .lg-width {
          max-width: 31.5% !important;
        }
      }
      .section-filters-bar.v2 .form .form-item.split {
        flex-direction: row;
      }

      @media (max-width: 952px) {
        .section-filters-bar.v2 .form .form-item.split {
          flex-direction: column !important;
          align-items: center;
        }
        .quests.section-filters-bar.v2 .form .form-item.split .form-select {
          margin: 0px 6px 24px !important;
        }
      }
      .quests.section-filters-bar.v2 .form .form-item.split .form-select {
        width: 100%;
        margin: 0px 6px 0px;
      }
      .form {
        padding: 0px 18px;
      }
      .responsive-col {
        width: calc(100% / 12 * 12);
        margin-right: 8px !important;
      }

      ngx-slider > .ngx-slider-pointer.ngx-slider-pointer-min {
        width: 15px;
        height: 15px;
        background-color: #ffffff;
        top: -7px;
        border: black solid 1px;
      }

      ngx-slider > .ngx-slider-pointer.ngx-slider-pointer-max {
        width: 15px;
        height: 15px;
        background-color: #ffffff;
        top: -7px;
        border: black solid 1px;
      }

      .ngx-slider .ngx-slider-pointer:after {
        display: none !important;
      }

      ngx-slider > span.ngx-slider-span.ngx-slider-pointer.ngx-slider-pointer-max:after {
        width: 0px;
        height: 0px;
      }
      .sidebar-box {
        background-color: #fff !important;
      }
      .dark-mode {
        .navigation-widget-close-button-icon {
          fill: #fff !important;
        }
        label,
        .sidebar-box-title,
        .ngx-slider .ngx-slider-bubble {
          color: #fff !important;
        }
        .navigation-widget,
        .navigation-widget-info,
        .sidebar-box {
          background-color: #1d2333 !important;
          color: #fff !important;
        }
        .form-select label {
          background-color: inherit;
          color: #9aa4bf !important;
        }
        input[type='password'],
        input[type='text'],
        select,
        textarea {
          background-color: #1d2333 !important;
          border: 1px solid #3f485f !important;
          color: #fff !important;
          transition: border-color 0.2s ease-in-out;
        }
        .section-filters-bar .section-filters-bar-title a {
          color: #fff !important;
        }

        .section-filters-bar .section-filters-bar-title .separator {
          background-color: #fff;
        }

        .section-filters-bar .section-filters-bar-text {
          color: #9aa4bf !important;
        }

        .section-filters-bar .section-filters-bar-text .highlighted {
          color: #fff !important;
        }

        .table .table-row {
          background-color: #1d2333 !important;
          height: 100px;
        }

        .quest-item .quest-item-title,
        .quest-item-meta-title {
          color: white;
        }
        .section-filters-bar {
          background-color: #1d2333 !important;
        }
      }
    `,
  ],
})
export class MarketplaceComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  rtl;
  darkMode;
  json = JSON;
  headerImagePath;
  toPrice: string;
  defaultLimit = 7;
  fromPrice: string;
  baseUrl = BASE_URL;
  isHiddenDrawer = true;
  allLimits: any[] = [];
  maxValue: number = 40;
  minValue: number = 60;
  pagination: IPagination;
  priceRange: any = [0, 100];
  marketplaceIcon: PictureType;
  catalogueCategoriesLimit = 7;
  productAttributes: string[] = [];
  filter: InternalProductFilterType;
  selectedCategories: string[] = [];
  perPage: number = this.playerService.productsLimit;
  productFilter: Map<number, any> = new Map<number, any>();
  filtredProducts: InternalProductWithRatingsWithFavoriteStatusType[];
  loadingProducts$: Observable<boolean> = this.playerService.loadingProducts$;
  searchString = new FormControl('');

  createdAtSort: number;
  nameSort: number;
  priceSort: number;
  apiFilter: any;
  apiSort: any;

  constructor(private cd: ChangeDetectorRef, private modalService: ModalService, private playerService: PlayerService) {
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter().subscribe();
    this.playerService.productsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.playerService.productsPageIndex || 0,
        size: this.playerService.productsLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.playerService.productsPageIndex || 0) * this.playerService.productsLimit,
        endIndex: Math.min(((this.playerService.productsPageIndex || 0) + 1) * this.playerService.productsLimit - 1, pagination?.length - 1),
      };
      this.cd.markForCheck();
    });
  }

  ngOnInit(): void {
    this.playerService.filter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((filter) => {
      if (filter) {
        this.filter = filter;
        const catalogueCategories = filter?.catalogueCategories;
        this.productFilter.set(1, {
          maxValue: parseInt(this.filter?.priceRange?.max, 10),
          minValue: parseInt(this.filter?.priceRange?.min, 10),
          filter: {
            ...filter,
            catalogueCategories,
          },
          priceRange: [0, +this.filter?.priceRange?.max],
          maxPrice: parseInt(this.filter?.priceRange?.max, 10),
          someRange2config: {
            behaviour: 'drag',
            connect: [true, true, true],
            step: 5,
            start: [0, 100],
            pageStep: 1,
            range: {
              min: 0,
              max: parseInt(this.filter?.priceRange?.max),
            },
          },
        });
        console.log('productFilter', this.productFilter);
        this.maxValue = parseInt(this.filter?.priceRange?.max, 10);
        this.minValue = parseInt(this.filter?.priceRange?.min, 10);
        forEach(this.filter?.productAttributesValues, (attribute) => {
          this.allLimits = [
            ...this.allLimits,
            {
              min: attribute.attributeValues.length < 5 ? attribute.attributeValues.length : 5,
            },
          ];
        });
        this.cd.markForCheck();
      }
    });
    this.playerService.filtredProducts$.pipe(takeUntil(this.unsubscribeAll)).subscribe((filtredProducts) => {
      if (filtredProducts) {
        this.filtredProducts = filtredProducts.objects;
      }
    });
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.marketplaceIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_MARKETPLACE').picture;
        this.cd.markForCheck();
      }
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
  }

  sortBy(selectedSort: string) {
    const sortOptions: { [key: string]: { field: string; value: number } } = {
      nameAsc: { field: 'nameSort', value: 1 },
      dateDesc: { field: 'createdAtSort', value: -1 },
      priceAsc: { field: 'priceSort', value: 1 },
      priceDesc: { field: 'priceSort', value: -1 },
    };
    this.nameSort = null;
    this.createdAtSort = null;
    this.priceSort = null;
    if (selectedSort && sortOptions[selectedSort]) {
      const { field, value } = sortOptions[selectedSort];
      this[field] = value;
    }
    this.sortItems();
  }

  sortItems() {
    this.apiSort = [
      ...(this.createdAtSort !== null ? [{ createdAt: this.createdAtSort }] : []),
      ...(this.nameSort !== null ? [{ name: this.nameSort }] : []),
      ...(this.priceSort !== null ? [{ price: this.priceSort }] : []),
    ].filter((item) => item?.createdAt || item?.name || item?.price);
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter(false, this.apiFilter, this.apiSort).subscribe((res) => {
      if (res) {
        this.cd.markForCheck();
      }
    });
  }

  isCategoryChecked(value: string) {
    return this.selectedCategories.includes(value);
  }

  isAttributeChecked(value: string) {
    return this.productAttributes.includes(value);
  }

  searchItems() {
    this.playerService.searchString = this.searchString.value;
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter(false, this.apiFilter, this.apiSort).subscribe();
  }

  cleanAll() {
    this.selectedCategories = [];
    this.productAttributes = [];
    this.apiFilter = {
      fromPrice: null,
      toPrice: null,
    };
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter(true, this.apiFilter, this.apiSort).subscribe();
  }

  onValueChange(event: ChangeContext) {
    this.fromPrice = '' + event.value;
    this.toPrice = '' + event.highValue;
    this.priceRange = [event.value / 10, event.highValue / 10];
    this.apiFilter = {
      fromPrice: this.fromPrice.toString(),
      toPrice: this.toPrice.toString(),
    };
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter(false, this.apiFilter, this.apiSort).subscribe();
    this.isHiddenDrawer = true;
    this.cd.markForCheck();
  }

  sliderOptions(): Options {
    return {
      floor: parseInt(this.filter?.priceRange?.min, 10),
      ceil: parseInt(this.filter?.priceRange?.max, 10),
      getSelectionBarColor: (value: number): string => {
        return 'black';
      },
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return value + ' DT';
          case LabelType.High:
            return value + ' DT';
          default:
            return value + ' DT';
        }
      },
    };
  }

  onPageChange(page: number): void {
    this.playerService.productsPageIndex = page - 1;
    this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter().subscribe();
  }

  onChangeCategory(checked: boolean, id: string) {
    this.playerService.productsPageIndex = 0;
    if (checked) {
      this.selectedCategories.push(id);
    } else {
      this.selectedCategories = this.selectedCategories.filter((m) => m !== id);
    }
    this.cd.markForCheck();
  }

  onChangeAttributes(checked: boolean, id: string) {
    this.playerService.productsPageIndex = 0;
    if (checked) {
      this.productAttributes.push(id);
    } else {
      this.productAttributes.pop();
    }
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    this.playerService.currentPage$ = 1;
    this.playerService.searchString = '';
    this.playerService.productsPageIndex = 0;
  }
}
