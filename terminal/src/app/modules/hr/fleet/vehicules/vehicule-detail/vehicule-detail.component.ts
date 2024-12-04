import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Swiper Slider
import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';

import { productModel, productList } from '../product.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-vehicule-detail',
  templateUrl: './vehicule-detail.component.html',
  styleUrls: ['./vehicule-detail.component.scss'],
})

/**
 * ProductDetail Component
 */
export class VehiculeDetailComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  public productDetail!: productModel[];
  isImage;
  defaultSelect = 2;
  readonly = false;
  products: any;

  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;

  constructor(private route: ActivatedRoute, private modalService: NgbModal, private translate: TranslateService) {
    this.products = this.route.snapshot.params;

    this.route.params.subscribe(
      (params) =>
        (this.productDetail = productList.filter(function (product) {
          return product.id == parseInt(params['id']);
        })),
    );
    this.isImage = this.productDetail[0].images[0];
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.VEHICULE_DETIALS').subscribe((vehiculeDetails: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: vehiculeDetails, active: true }];
      });
    });
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
