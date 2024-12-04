import { Observable, combineLatest, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';

import { BarcodeStatsType } from '@sifca-monorepo/terminal-generator';
import { InternalProductWithStockType } from '@sifca-monorepo/terminal-generator';
import { BarcodeType, InternalProductType } from '@sifca-monorepo/terminal-generator';

import { SharedService } from '../../../../../shared/services/shared.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { ProductsService } from '../../../../inventory/products/products/products.service';

@Component({
  selector: 'sifca-monorepo-product-click-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class ProductClickDetailComponent implements OnInit {
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
  MarketplaceChart: any;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private translate: TranslateService,
    private sharedService: SharedService,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private validationHelper: ValidationHelper,
  ) {
    this._marketplaceChart('["--vz-primary","--vz-success", "--vz-gray-300"]');
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.INVENTORY'), this.translate.get('MENUITEMS.TS.PRODUCT_DETAILS')])
      .pipe(
        map(([inventory, productDetails]: [string, string]) => {
          this.breadCrumbItems = [{ label: inventory }, { label: productDetails, active: true }];
        }),
      )
      .subscribe();
  }

  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(' ', '');
          return color;
        } else return newValue;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  private _marketplaceChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.MarketplaceChart = {
        series:  [{
            name: "Artwork",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }],
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: colors,
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        }
    };
}

  // private _marketGraphChart(walletChart: any, colors: any) {
  //   colors = this.getChartColorsArray(colors);
  //   this.translate.get('MENUITEMS.TS.BALANCE').subscribe((balance: string) => {
  //     this.marketGraphChart = {
  //       series: [
  //         {
  //           name: balance,
  //           data: walletChart?.chart,
  //         },
  //       ],
  //       chart: {
  //         id: 'area-datetime',
  //         type: 'area',
  //         height: 320,
  //         zoom: {
  //           autoScaleYaxis: true,
  //         },
  //         toolbar: {
  //           show: false,
  //         },
  //       },
  //       yaxis: {
  //         title: {
  //           text: (this.currency || '$') + ' (thousands)',
  //         },
  //       },
  //       dataLabels: {
  //         enabled: false,
  //       },
  //       markers: {
  //         size: 0,
  //       },
  //       xaxis: {
  //         type: 'datetime',
  //         ...(walletChart?.chart?.length ? { min: new Date(format(walletChart?.chart[0][0], 'dd MMM yyyy')).getTime() } : {}),
  //         tickAmount: 6,
  //       },
  //       tooltip: {
  //         x: {
  //           format: 'dd MMM yyyy',
  //         },
  //         y: {
  //           formatter: (y: any) => {
  //             if (typeof y !== 'undefined') {
  //               return this.currency + ' ' + y.toFixed(2) + 'k';
  //             }
  //             return y;
  //           },
  //         },
  //       },
  //       fill: {
  //         type: 'gradient',
  //         gradient: {
  //           shadeIntensity: 1,
  //           inverseColors: false,
  //           opacityFrom: 0.45,
  //           opacityTo: 0.05,
  //           stops: [20, 100, 100, 100],
  //         },
  //       },
  //       colors: colors,
  //     };
  //   });

  //   this.changeDetectorRef.markForCheck();
  // }

  previousSlideComp() {
    this.componentRef!.directiveRef!.prevSlide();
  }

  nextSlideComp() {
    this.componentRef!.directiveRef!.nextSlide();
  }
}
