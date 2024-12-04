import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { BarcodeType, BrandType } from '@sifca-monorepo/terminal-generator';

import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { Subject, combineLatest, map, takeUntil } from 'rxjs';
import { BrandService } from '../brands.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-brand-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class BrandDetailComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  public productDetail!: BarcodeType[];
  isImage;
  defaultSelect = 2;
  readonly = false;
  products: any;

  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;

  private unsubscribeAll: Subject<any> = new Subject<any>();
  brand: BrandType;
  validateBarcode = this.validationHelper.validateBarcode;

  constructor(
    public service: BrandService,
    private translate: TranslateService,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.service.brand$.pipe(takeUntil(this.unsubscribeAll)).subscribe((brand: BrandType) => {
      this.brand = brand;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.INVENTORY'), this.translate.get('MENUITEMS.TS.BRAND_DETAILS')]).pipe(
      map(([inventory, brandDetail]: [string, string]) => {
        this.breadCrumbItems = [{ label: inventory }, { label: brandDetail, active: true }];
      })
    ).subscribe();
  }

  /**
   * Swiper setting
   */
  config = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  /**
   * Swiper card previous set
   */
  previousSlideComp() {
    this.componentRef!.directiveRef!.prevSlide();
  }

  /**
   * Swiper card next set
   */
  nextSlideComp() {
    this.componentRef!.directiveRef!.nextSlide();
  }
}
