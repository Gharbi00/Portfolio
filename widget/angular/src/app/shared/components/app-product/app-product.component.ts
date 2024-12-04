import { ActivatedRoute, Router } from '@angular/router';
import { BASE_URL, defaultPicture } from '../../../../environments/environment';
import { Component, OnInit, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { PlayerService } from '../../../modules/player/player.service';
import { InternalProductWithRatingsWithFavoriteStatusType, PointOfSaleType } from '@sifca-monorepo/widget-generator';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './app-product.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      :host {
        display: contents;
      }
      .dark-mode {
        h1,
        h2,
        h3,
        h4,
        h5,
        p a {
          color: #fff !important;
        }

        .product-preview-author-title {
          color: #fff;
        }

        .text-sticker {
          color: #fff;
          background-color: #293249 !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
        }

        .product-preview {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .section-header-info .section-pretitle {
          color: #9aa4bf !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
        }

        .section-header-info .section-title .highlighted {
          color: #fff;
        }

        .section-header-info .section-title .highlighted.secondary {
          color: var(--dynamic-color);
        }

        .section-header-info .section-title.pinned:before {
          content: 'pinned' !important;
          display: inline-block !important;
          margin-right: 12px !important;
          padding: 4px 8px !important;
          border-radius: 200px !important;
          background-color: #40d04f !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1em !important;
          text-transform: uppercase !important;
          position: relative !important;
          top: -4px;
        }

        .product-preview {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .product-preview-meta {
          background-color: #1d2333 !important;
          border-top: 1px solid #45456f !important;
        }

        .widget-box {
          background-color: #1d2333 !important;
        }

        .widget-box .widget-box-title .highlighted {
          color: #fff;
        }

        .widget-box .widget-box-text.light {
          color: #9aa4bf;
        }

        .widget-box .widget-box-status .content-actions {
          margin-top: 28px !important;
          border-top: 1px solid #2f3749;
        }
      }
    `,
  ],
})
export class ProductComponent implements OnInit {
  @Input() product: InternalProductWithRatingsWithFavoriteStatusType;
  @Input() isDragging: boolean;

  rtl: boolean;
  darkMode: boolean;
  baseUrl = BASE_URL;
  defaultPicture = defaultPicture;
  pos$: Observable<PointOfSaleType> = this.playerService.pos$;

  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private modalService: ModalService,
    private playerService: PlayerService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((rtl) => {
      this.rtl = rtl;
      this.cd.detectChanges();
    });
  }

  goToProductPage() {
    this.playerService.createProductClicks(this.product?.id).subscribe();
  }
}
