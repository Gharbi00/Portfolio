import { OwlOptions } from 'ngx-owl-carousel-o';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { BASE_URL, defaultPicture } from '../../../../../src/environments/environment';
import { ModalService } from '../../services/modal.service';
import { ChallengeTypeWinner } from '@sifca-monorepo/widget-generator';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/dark.scss';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';

      :host {
        display: contents;
      }

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      .widget-box {
        width: 100%;
      }
      .owl-carousel .owl-item {
        display: grid !important;
        place-items: center !important;
      }

      @media screen and (min-width: 1200px) {
        .widget-box .widget-box-content {
          margin-top: 15px;
        }
      }
      @media (min-width: 1200px) {
        .special-widget-box {
          padding: 15px 25px;
        }
      }

      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
      }

      ::ng-deep.level-24 .widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .challenge-size {
        width: 220px;
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

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }
        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }
    `,
  ],
})
export class RewardsComponent implements OnInit {
  @Input() winners: ChallengeTypeWinner[];

  rtl;
  darkMode;
  defaultPicture = defaultPicture;
  challengesCarousel: OwlOptions = {
    autoplay: true,
    autoplayTimeout: 8000,
    margin: 20,
    loop: true,
    dots: true,
    rtl: false,
    responsive: {
      0: { items: 1 },
      450: { items: 2 },
      700: { items: 3 },
      1000: { items: 4 },
      1300: { items: 5 },
    },
  };

  constructor(private modalService: ModalService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.updateCarouselOptions();
      this.cd.detectChanges();
    });
  }

  updateCarouselOptions() {
    this.challengesCarousel = {
      autoplay: true,
      autoplayTimeout: 8000,
      margin: 20,
      loop: true,
      dots: true,
      rtl: this.rtl,
      responsive: {
        0: { items: 1 },
        450: { items: 2 },
        700: { items: 3 },
        1000: { items: 4 },
        1300: { items: 5 },
      },
    };
  }
}
