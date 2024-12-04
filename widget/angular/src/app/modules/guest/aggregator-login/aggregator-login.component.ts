import { find } from 'lodash';
import { switchMap, throwError, map as rxMap, of, takeUntil, Subject, take, combineLatest } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AppCookieService, StorageHelper } from '@diktup/frontend/helpers';
import { ListenForUserLoggedInForTargetGQL, PictureType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player/player.service';
import { ModalService } from '../../../shared/services/modal.service';
import { ACCESS_TOKEN, BASE_URL } from '../../../../environments/environment';
import { ProfileService } from '../../player/components/profile/profile.service';

@Component({
  selector: 'app-aggregator',
  templateUrl: './aggregator-login.component.html',
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

      @media (min-width: 988px) {
        .h-large {
          height: 653px !important;
        }
      }

      @media (max-width: 988px) {
        .h-small {
          height: 600px !important;
        }
      }

      @media (max-width: 988px) {
        .mb-small {
          margin-bottom: 48px !important;
        }
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }

      @media screen and (min-width: 1200px) {
        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text .light {
          font-size: 12.8px;
          font-weight: 500;
          text-transform: none;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text {
          font-size: 16px;
          font-weight: 700;
        }
      }

      .badge-item-stat-image {
        max-width: 80px;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .badge-item-stat .progress-stat {
        max-width: 204px;
        margin: 0px auto 0;
      }

      .level-progress-box .progress-stat {
        width: 90% !important;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .transactions.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .reward.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .earn.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .notifications.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .profile.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .edit-profile.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .chat.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .quests.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .challenge.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .badge-item-stat .badge-stat-text {
        width: auto;
        margin: 16px auto 0;
        color: #3e3f5e;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.4285714286em;
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

      .rounded-circle {
        width: 20px;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }

      .text-sticker .text-sticker-icon-red {
        margin-right: 4px;
        fill: #d90000;
      }

      .coin-transaction {
        width: 20px;
        height: 20px;
        margin-bottom: -12%;
      }
      .dark-mode {
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

        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
          fill: #fff;
        }

        .stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
          fill: #fff;
        }

        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
        }

        .table .table-column .table-text .light {
          color: #9aa4bf;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info {
          color: #fff !important;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info.negative {
          color: #fff;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info .light {
          color: #9aa4bf;
        }

        .progress-stat .progress-stat-info {
          color: #9aa4bf !important;
        }

        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }

        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }

        .album-preview .text-sticker {
          position: absolute !important;
          top: 18px !important;
          right: 18px !important;
          z-index: 3 !important;
          pointer-events: none;
        }

        .popup-box .popup-box-subtitle .light {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .badge-item-stat {
          padding: 32px 28px !important;
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
          position: relative;
        }

        .badge-item-stat .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }

        .badge-item-stat .badge-item-stat-image-preview {
          position: absolute !important;
          top: 32px !important;
          left: 28px;
        }

        .badge-item-stat .badge-item-stat-image {
          display: block !important;
          margin: 0 auto;
        }

        .badge-item-stat .badge-item-stat-title {
          margin-top: 36px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          text-align: center;
        }

        .badge-item-stat .badge-stat-text {
          // width: 180px !important;
          margin: 16px auto 0 !important;
          color: #9aa4bf !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.4285714286em !important;
        }

        .badge-item-stat .progress-stat {
          max-width: 204px !important;
          margin: 54px auto 0;
        }

        .quest-preview .progress-stat {
          margin-top: 16px;
        }

        .quest-item .text-sticker {
          color: white;
        }

        .quest-item .progress-stat {
          max-width: 228px !important;
          margin-top: 48px;
        }

        .header .header-actions .progress-stat {
          width: 110px;
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
      }
      .rtl {
        .badge-item-stat .text-sticker {
          right: auto !important;
          left: -6px !important;
        }
        .badge-item-stat .badge-item-stat-image-preview {
          right: 28px !important;
          left: auto !important;
        }
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
      .dark-mode .checkbox-wrap input[type='checkbox']:checked + .checkbox-box {
        background-color: #fff !important;
        border-color: #fff !important;
      }
      .dark-mode.checkbox-wrap input[type='radio']:checked + .checkbox-box.round {
        border: 6px solid #fff !important;
      }
      .dark-mode.checkbox-line .checkbox-line-text {
        color: #fff !important;
      }
      .rtl {
        .checkbox-wrap .checkbox-box {
          right: 0 !important;
          left: auto !important;
        }
      }
      .qrcode-wrapper {
        position: relative;
        display: inline-block;
      }

      .qr-center-image {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        pointer-events: none; /* Ensures the QR code is still scannable */
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      ::placeholder {
        font-size: 14px !important;
      }
      .text-right {
        text-align: right !important;
      }
      .text-left {
        text-align: left !important;
      }
      @media (max-width: 768px) {
        .qrcode-container {
          order: 1;
        }

        .col-lg-8 {
          order: 2;
        }
      }

      @media (min-width: 769px) {
        .qrcode-container {
          order: 2;
        }

        .col-lg-8 {
          order: 1;
        }
      }

      .special-height {
        height: 53vh;
      }

      @media (min-width: 1501px) {
        .special-height {
          height: 59vh;
        }
      }

      @media (min-width: 1200px) and (max-width: 1500px) {
        .special-height {
          height: 55vh;
        }
      }

      @media (min-width: 701px) and (max-width: 1199px) {
        .special-height {
          height: 53vh;
        }
      }

      @media (max-width: 700px) {
        .special-height {
          height: 49vh;
        }
      }
    `,
  ],
})
export class AggregatorLoginComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  darkMode;
  posId: string;
  qrText: string;
  headerImagePath;
  baseUrl = BASE_URL;
  badgesIcon: PictureType;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private storageHelper: StorageHelper,
    private playerService: PlayerService,
    private profileService: ProfileService,
    private appCookieService: AppCookieService,
    private listenForUserLoggedInForTargetGQL: ListenForUserLoggedInForTargetGQL,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.badgesIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGES_ICON').picture;
      }
    });
    const timestampInSeconds = Math.floor(Date.now() / 1000).toString();
    this.posId = (window as any).widgetInit.appId;
    this.qrText = `loyalcraft.com/m/lri=${timestampInSeconds}/${this.posId}`;
    this.listenForUserLoggedInForTargetGQL
      .subscribe({ reference: timestampInSeconds, target: { pos: this.posId } })
      .pipe(
        switchMap(({ data, errors }: any) => {
          if (data) {
            this.modalService.isCompleteProfile$ = true;
            this.playerService.loginVibrating$ = false;
            this.storageHelper.setData({ [ACCESS_TOKEN]: data.listenForUserLoggedInForTarget.accessToken });
            this.appCookieService.set(ACCESS_TOKEN, data.listenForUserLoggedInForTarget.accessToken);
            this.storageHelper.setData({ elvkwdigtauth: 'true' });
            this.playerService.authenticated$ = true;
            return this.playerService.userToken$.pipe(
              take(1),
              switchMap((token) => {
                const requests = [
                  this.playerService.saveCurrentCorporateUserStatus(),
                  this.profileService.currentUserComplete(),
                  this.playerService.findPredefinedQuestsByTargetWithRepeatDate(),
                  this.playerService.getUserWalletWithReputations(),
                ];

                if (token) {
                  requests.push(
                    this.profileService.getProfileCompletnessProgress(null, token),
                    this.playerService.getUserWalletWithReputations(token),
                    this.playerService.getLastReferral(token),
                    this.playerService.getCurrentUserReputationsLossDate(token),
                    this.playerService.getCurrentUserReputationsTurnoverLossDate(token),
                    this.playerService.getCurrentUserQuantitativeWallets(token),
                  );
                }
                return combineLatest(requests);
              }),
            );
          } else if (errors) {
            this.playerService.authenticated$ = false;
            return throwError(() => new Error('Error while logging in.'));
          }
          return of(null);
        }),
        rxMap((response) => {
          const res = response[0];
          this.storageHelper.setData({ elevkusr: res?.id });
          this.appCookieService.set('elevkusr', res?.id);
          return response;
        }),
      )
      .subscribe(() => {
        this.modalService.toggleModal('player');
        this.modalService.togglePopUp('home');
        this.modalService.isHidden$ = false;
        this.cd.markForCheck();
      });
  }

  ngOnInit(): void {
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
}
