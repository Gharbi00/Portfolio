import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';

import { ChallengeService } from '../challenge.service';
import { BASE_URL, defaultPicture } from '../../../../../../environments/environment';
import { ModalService } from '../../../../../shared/services/modal.service';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { ChallengeType, PictureType, WalletType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { PlayerService } from '../../../player.service';
import { find } from 'lodash';

@Component({
  selector: 'app-challenge-details',
  templateUrl: './details.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
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

      .ql-container.ql-snow {
        border: 0px !important;
      }

      .widget-box-button {
        width: 100%;
        margin-top: 32px;
        color: #7750f8;
        color: var(--dynamic-color);
        font-weight: 700;
        background-color: white;
        border: 1px solid #7750f8;
        border: 1px solid var(--dynamic-color);
      }
      .widget-box-button:hover {
        color: white !important;
        font-weight: 700;
        background-color: var(--dynamic-color);
        border: 1px solid var(--dynamic-color);
      }
      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
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

      .level-24 .badge-item img {
        position: relative !important;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .chat.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .product-preview .product-preview-info .product-preview-category:before {
        content: none;
      }

      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .white-color {
        color: #fff !important;
      }

      .special-badge-text {
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        position: relative;
        z-index: 6;
        font-size: 16px;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }
        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }

      .challenges-quests {
        padding: 0px 10%;
        margin-bottom: 20px;
      }
      .challenge-size {
        width: 220px;
      }

      .text-sticker .text-sticker-icon-red {
        margin-right: 4px;
        fill: #d90000;
      }

      .profile-avatar-badge-small {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        position: absolute;
        top: 27px;
        right: -46px;
        z-index: 5000;
        background-color: var(--dynamic-color3);
        -webkit-clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .dark-mode {
        h1,
        h2,
        h3,
        h4,
        h5,
        p a {
          color: #fff!important;
        }

        .button {
          background-color: #293249 !important;
          color: #fff !important;
          border: 1px solid #293249 !important;
        }

        .button:hover {
          color: #fff !important;
          background-color: #323e5b !important;
        }

        .button .button-icon {
          fill: #fff !important;
          transition: fill 0.2s ease-in-out;
        }

        .user-short-description .user-short-description-title a {
          color: #fff !important;
        }

        .user-short-description .user-short-description-text a {
          color: #9aa4bf !important;
        }

        .user-short-description .user-short-description-text a:hover {
          color: #fff;
        }

        .text-sticker {
          background-color: #293249 !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
        }

        .text-sticker .highlighted {
          color: #fff;
        }

        .text-sticker .text-sticker-icon {
          margin-right: 4px !important;
          fill: #fff !important;
        }

        .meta-line .meta-line-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .forum-category .forum-category-info .forum-category-link a {
          color: #fff !important;
        }

        .forum-category .forum-category-info .forum-category-link a:hover {
          color: #fff;
        }

        .discussion-preview .discussion-preview-meta .discussion-preview-meta-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
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

        .user-status .user-status-text a {
          color: #9aa4bf;
        }

        .cart-item-preview .cart-item-preview-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .dropdown-box-actions .dropdown-box-action .button {
          width: 156px;
        }

        .navigation-widget .navigation-widget-info-wrap .navigation-widget-info .navigation-widget-info-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-peek .post-peek-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .post-preview-line-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .post-preview-line-author a {
          color: #fff !important;
          font-weight: 700;
        }

        .product-preview {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .product-preview.small .product-preview-image {
          height: 144px !important;
          border-radius: 12px;
        }

        .product-preview.small .product-preview-info {
          padding: 20px 0 0;
        }

        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }

        .product-preview.small .product-preview-info .product-preview-title {
          font-size: 14px;
        }

        .product-preview.tiny .product-preview-image {
          width: 94px !important;
          height: 60px !important;
          margin-right: 20px !important;
          border-radius: 12px;
        }

        .product-preview.tiny .product-preview-info {
          padding: 4px 0 0;
        }

        .product-preview.tiny .product-preview-info .product-preview-title {
          font-size: 14px;
        }

        .product-preview.tiny .product-preview-info .product-preview-category {
          margin-top: 6px;
        }

        .product-preview.tiny .product-preview-info .product-preview-creator {
          margin-top: 6px !important;
          color: #9aa4bf !important;
          font-size: 12px !important;
          font-weight: 700;
        }

        .product-preview.tiny .product-preview-info .product-preview-creator a {
          color: #9aa4bf !important;
          font-weight: 700;
        }

        .product-preview.micro .product-preview-image {
          width: 68px !important;
          height: 44px !important;
          margin-right: 12px !important;
          border-radius: 12px;
        }

        .product-preview.micro .product-preview-info {
          padding: 6px 0 0;
        }

        .product-preview.micro .product-preview-info .product-preview-title {
          font-size: 14px;
        }

        .product-preview.micro .product-preview-info .product-preview-category {
          margin-top: 6px;
        }

        .product-preview .product-preview-image {
          height: 180px !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px;
        }

        .product-preview .product-preview-info {
          padding: 28px !important;
          position: relative;
        }

        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }

        .product-preview .product-preview-info .product-preview-category a,
        .product-preview .product-preview-info .product-preview-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .product-preview .product-preview-info .product-preview-title {
          font-size: 16px !important;
          font-weight: 700;
        }

        .product-preview .product-preview-info .product-preview-category {
          margin-top: 8px !important;
          padding-left: 14px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          position: relative;
        }

        .product-preview .product-preview-info .product-preview-category.digital:before {
          border-color: #00e2cb;
        }

        .product-preview .product-preview-info .product-preview-category.physical:before {
          border-color: #66e273;
        }

        // .product-preview .product-preview-info .product-preview-category:before {
        //   content: '' !important;
        //   width: 8px !important;
        //   height: 8px !important;
        //   border-radius: 50% !important;
        //   border: 2px solid #3e3f5e !important;
        //   position: absolute !important;
        //   top: 1px !important;
        //   left: 0;
        // }

        .product-preview .product-preview-info .product-preview-text {
          margin-top: 20px !important;
          color: #9aa4bf !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.4285714286em;
        }

        .product-preview .product-preview-info .button {
          margin-top: 36px;
        }

        .product-preview .product-preview-meta {
          display: -ms-flexbox !important;
          display: flex !important;
          -ms-flex-pack: justify !important;
          justify-content: space-between !important;
          -ms-flex-align: center !important;
          align-items: center !important;
          height: 53px !important;
          padding: 0 28px !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          background-color: #21283b !important;
          border-top: 1px solid #2f3749;
        }

        .product-preview .product-preview-author {
          padding-left: 26px !important;
          position: relative;
        }

        .product-preview .product-preview-author .product-preview-author-image {
          position: absolute !important;
          top: 1px !important;
          left: 0;
        }

        .product-preview .product-preview-author .product-preview-author-title {
          font-size: 10px !important;
          font-weight: 500;
        }

        .product-preview .product-preview-author .product-preview-author-text {
          margin-top: 1px !important;
          font-size: 12px !important;
          font-weight: 700;
        }

        .product-preview .product-preview-author .product-preview-author-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .stream-box .stream-box-info .stream-box-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .stream-box .stream-box-info .stream-box-text a {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .user-preview .user-preview-info .user-preview-actions .button {
          width: 100% !important;
          margin-right: 16px;
        }

        .user-preview .user-preview-info .user-preview-actions .button:last-child {
          margin-right: 0;
        }

        .user-preview .user-preview-info .user-preview-actions .button .button-icon {
          fill: #fff;
        }

        .user-preview .user-preview-author .user-preview-author-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .user-preview .user-preview-footer .user-preview-footer-action.full .button {
          width: 100%;
        }

        .user-preview .user-preview-footer .user-preview-footer-action .button {
          width: 64px !important;
          height: 44px;
        }

        .album-preview .text-sticker {
          position: absolute !important;
          top: 18px !important;
          right: 18px !important;
          z-index: 3 !important;
          pointer-events: none;
        }

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
          margin-bottom: 16px;
        }

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
          margin-bottom: 0;
        }

        .popup-box .popup-box-body .popup-box-sidebar .product-preview {
          box-shadow: none !important;
          border-top-right-radius: 0;
        }

        .popup-box .popup-box-body .popup-box-sidebar .product-preview .product-preview-image {
          border-top-right-radius: 0;
        }

        .popup-box .popup-box-body .popup-box-content .widget-box {
          box-shadow: none;
        }

        .badge-item-stat .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }

        .streamer-box.small .streamer-box-info .button {
          margin-top: 28px;
        }

        .streamer-box .streamer-box-info .button {
          margin-top: 40px !important;
          width: 100%;
        }

        .event-preview .button {
          width: 100% !important;
          margin-top: 38px;
        }

        .quest-item .text-sticker {
          color: white;
        }

        .forum-post .forum-post-user .forum-post-user-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .forum-post .forum-post-user .forum-post-user-text a {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .forum-post .forum-post-user .forum-post-user-text a:hover {
          color: #fff;
        }

        .slider-panel .slider-panel-roster .button {
          width: 180px !important;
          margin-right: 28px !important;
          position: relative !important;
          z-index: 2;
        }

        .demo-box .button {
          margin-top: 36px !important;
          overflow: hidden !important;
          position: relative;
        }

        .demo-box .button .active-text,
        .demo-box .button .inactive-text {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transition: -webkit-transform 0.3s ease-in-out !important;
          transition: transform 0.3s ease-in-out !important;
          transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;
        }

        .demo-box .button .active-text {
          -webkit-transform: translateY(100%) !important;
          transform: translateY(100%);
        }

        .header .header-actions .login-form .button {
          width: 52px !important;
          height: 52px !important;
          -ms-flex-negative: 0 !important;
          flex-shrink: 0;
        }

        .menu .menu-item.active .menu-item-link .menu-item-link-icon,
        .menu .menu-item.active .menu-item-link:hover .menu-item-link-icon {
          fill: #fff;
        }

        .menu .menu-item .menu-item-link:hover .menu-item-link-icon {
          fill: #fff;
        }

        .menu .menu-item .menu-item-link .menu-item-link-icon {
          position: absolute !important;
          top: 14px !important;
          left: 14px !important;
          pointer-events: none !important;
          transition: all 0.2s ease-in-out;
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

        .section-filters-bar .section-filters-bar-title a {
          color: #fff !important;
        }

        a,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        .quest-item .quest-item-title,
        .quest-item-meta-title {
          color: white;
        }
        .color-invert {
          filter: invert(1);
        }
      }
      .rtl {
        .section-banner .section-banner-icon {
          left: 0 !important;
        }
        .section-banner-text,
        .section-banner-title {
          transform: scaleX(-1) !important;
        }
        .section-banner {
          transform: scaleX(-1) !important;
        }
      }
      .countdown {
        direction: ltr;
        unicode-bidi: isolate;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class LeaderboardDetailsComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  darkMode;
  headerImagePath;
  baseUrl = BASE_URL;
  displayTime: string = '';
  challenge: ChallengeType;
  quantitativeWallet: WalletType;
  defaultPicture = defaultPicture;
  leaderboard$: Observable<any[]> = this.challengeService.leaderboard$;
  loadingLeaderboard$: Observable<boolean> = this.challengeService.loadingLeaderboard$;
  defaultChallengeImage = 'https://images.pexels.com/photos/3077882/pexels-photo-3077882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
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
  loading = true;
  rocketIcon: PictureType;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private challengeService: ChallengeService,
    private leaderboardService: LeaderboardService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false;
      this.cd.markForCheck();
    }, 2000)
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.rocketIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_ROCKET').picture;
      }
    })
    this.challengeService.selectedChallenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((selectedChallenge) => {
      this.challenge = selectedChallenge;
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.updateCarouselOptions();
      this.cd.detectChanges();
    });
    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
    this.playerService.quantitativeWallet$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quantitativeWallet) => {
      this.quantitativeWallet = quantitativeWallet;
    });
  }

  getCountdown(endDate: string): any {
    if (!endDate) return null;
    if (isAfter(parseISO(endDate), new Date())) {
      const challengeDate = new Date(endDate);
      const now = new Date();
      const difference = Math.abs(challengeDate.getTime() - now.getTime());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    } else {
      return 0;
    }
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

  toggleModal(modalName: string): void {
    this.leaderboardService.getChallengeLeaderboardWithCurrentUser(this.challenge?.id).subscribe();
    this.modalService.togglePopUp(modalName, this.element);
  }

  formatTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
