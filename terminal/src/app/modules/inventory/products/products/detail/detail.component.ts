import { Observable, combineLatest, map } from 'rxjs';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';

import { BarcodeStatsType } from '@sifca-monorepo/terminal-generator';
import { InternalProductWithStockType } from '@sifca-monorepo/terminal-generator';
import { BarcodeType, InternalProductType } from '@sifca-monorepo/terminal-generator';

import { ProductsService } from '../products.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-product-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;

  isImage;
  readonly = false;
  defaultSelect = 2;
  breadCrumbItems!: Array<{}>;
  productDetail!: InternalProductType[];
  validateBarcode = this.validationHelper.validateBarcode;
  pageId$: Observable<string> = this.inventoryService.pageId$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  barcodes$: Observable<BarcodeType[]> = this.productsService.barcodes$;
  product$: Observable<InternalProductWithStockType> = this.productsService.product$;
  internalProductStats$: Observable<BarcodeStatsType> = this.productsService.internalProductStats$;
  config = {
    initialSlide: 0,
    slidesPerView: 1,
  };
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private validationHelper: ValidationHelper,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.INVENTORY'), this.translate.get('MENUITEMS.TS.PRODUCT_DETAILS')])
      .pipe(
        map(([inventory, productDetails]: [string, string]) => {
          this.breadCrumbItems = [{ label: inventory }, { label: productDetails, active: true }];
        }),
      )
      .subscribe();
  }

  previousSlideComp() {
    this.componentRef!.directiveRef!.prevSlide();
  }

  nextSlideComp() {
    this.componentRef!.directiveRef!.nextSlide();
  }
}
