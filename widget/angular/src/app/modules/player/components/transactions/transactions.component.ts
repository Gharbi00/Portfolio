import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { LoyaltySettingsType, PictureType, UserType, WalletTransactionType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { TransactionsService } from './transactions.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { PlayerService } from '../../player.service';
import { IPagination } from '@diktup/frontend/models';
import { ProfileService } from '../profile/profile.service';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import ar from 'date-fns/locale/ar';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import { find } from 'lodash';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
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

      .empty-fill {
        fill: #000000;
      }
      .dark-mode .empty-fill {
        fill: #ffffff;
      }

      @media (max-width: 679px) {
        .m-small-0 {
          margin: 0px !important;
        }
      }

      @media (max-width: 992px) {
        .gap-lg-1 {
          gap: 8px;
        }
      }
      .form-switch.active {
        background-color: #23d2e2;
      }

      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }
      .widget-box {
        width: 100%;
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

      .badge-item-stat-image {
        max-width: 80px;
      }
      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
      }

      /* level-24 styles */
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

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
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
      .dark-mode.text-sticker {
        background-color: #293249 !important;
        box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
      }
      .dark-mode.text-sticker .highlighted {
        color: #fff;
      }
      .dark-mode.text-sticker .text-sticker-icon {
        margin-right: 4px !important;
        fill: #fff !important;
      }
      .dark-mode .text-sticker {
        background-color: #293249 !important;
        box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
      }

      .dark-mode .text-sticker .highlighted {
        color: #fff;
      }

      .dark-mode .text-sticker .text-sticker-icon {
        margin-right: 4px !important;
        fill: #fff !important;
      }

      .dark-mode.simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
      .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
        fill: #fff;
      }
      .dark-mode.stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
        fill: #fff;
      }
      .dark-mode.banner-promo img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px;
      }
      .dark-mode.exp-line .exp-line-icon {
        fill: #616a82 !important;
      }
      .dark-mode.exp-line .exp-line-text {
        font-size: 14px !important;
        font-weight: 700 !important;
        line-height: 1.4285714286em;
      }
      .dark-mode.exp-line .exp-line-timestamp {
        color: #9aa4bf !important;
      }
      .dark-mode.widget-box {
        background-color: #1d2333 !important;
      }
      .dark-mode.widget-box .widget-box-title .highlighted {
        color: #fff;
      }
      .dark-mode.widget-box .widget-box-text.light {
        color: #9aa4bf;
      }
      .dark-mode.widget-box .widget-box-status .content-actions {
        margin-top: 28px !important;
        border-top: 1px solid #2f3749;
      }
      .dark-mode.product-preview.small .product-preview-info .text-sticker {
        right: -8px;
      }
      .dark-mode.product-preview .product-preview-info .text-sticker {
        position: absolute !important;
        top: -14px !important;
        right: 14px;
      }
      .dark-mode.album-preview .text-sticker {
        position: absolute !important;
        top: 18px !important;
        right: 18px !important;
        z-index: 3 !important;
        pointer-events: none;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-content .widget-box {
        box-shadow: none;
      }
      .dark-mode.popup-box .widget-box .form .form-row {
        padding: 0;
      }
      .dark-mode.badge-item-stat .text-sticker {
        position: absolute !important;
        top: 10px !important;
        right: -6px;
      }
      .dark-mode a,
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      .dark-mode h5,
      .dark-mode h6,
      .dark-mode p,
      .quest-item .quest-item-title,
      .quest-item-meta-title {
        color: white;
      }
      .rtl {
        .exp-line .exp-line-timestamp {
          left: 0 !important;
          right: auto !important;
        }
        .exp-line {
          padding-right: 0px !important;
          padding-left: 100px !important;
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
        @media screen and (max-width: 680px) {
          .exp-line .exp-line-icon {
            left: auto !important;
            right: -15px !important;
          }
          .exp-line .text-sticker {
            top: -4px !important;
            right: 4px !important;
          }
        }
      }
      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
      }

      .dark-mode .exp-line .exp-line-timestamp {
        color: #ffffff !important;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  darkMode;
  headerImagePath;
  baseUrl = BASE_URL;
  pagination: IPagination;
  perPage = this.transactionsService.pageLimit;
  currentUser$: Observable<UserType> = this.profileService.currentUser$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  loadingTransactions$: Observable<boolean> = this.transactionsService.loadingTransactions$;
  transactions: WalletTransactionType[];
  svgMap = {
    DONATION: '#svg-badges',
    REDEEM: '#svg-quests',
    CONVERSION: '#svg-return',
    ORDER_ADDED: '#svg-trophy',
    WALLET_TOPUP: '#svg-notification',
    MOBILE_ONSITE_ACTIVITY: '#svg-overview',
    PHYSICAL_ONSITE_ACTIVITY: '#svg-blog-posts',
    WEB_ONSITE_ACTIVITY: '#svg-marketplace',
    QUEST_FULFILLED: '#svg-events-monthly',
    REPUTATION_LOST: '#svg-clock',
    DEAL_ORDER_ADDED: '#svg-wallet',
  };
  overviewIcon: PictureType;

  constructor(
    private modalService: ModalService,
    private profileService: ProfileService,
    private playerService: PlayerService,
    private transactionsService: TransactionsService,
    private cd: ChangeDetectorRef,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.overviewIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_OVERVIEW_ICON').picture;
        this.cd.markForCheck();
      }
    })
    this.transactionsService.walletTransactions$.pipe(takeUntil(this.unsubscribeAll)).subscribe((transactions) => {
      if (transactions) {
        this.transactions = this.reduceTransactions(transactions);
      }
    });
    this.transactionsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.transactionsService.pageIndex || 0,
        size: this.transactionsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.transactionsService.pageIndex || 0) * this.transactionsService.pageLimit,
        endIndex: Math.min(((this.transactionsService.pageIndex || 0) + 1) * this.transactionsService.pageLimit - 1, pagination?.length - 1),
      };
      this.cd.markForCheck();
    });
  }

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
  }

  reduceTransactions(transactions) {
    return transactions.reduce((acc, trans) => {
      const transfDate = new Date(trans.createdAt);
      const dateDifference = formatDistanceToNow(transfDate, {
        addSuffix: true,
        locale:
          (window as any).widgetInit.locale === 'ar'
            ? ar
            : (window as any).widgetInit.locale === 'fr'
            ? fr
            : (window as any).widgetInit.locale === 'ar-tn'
            ? ar
            : (window as any).widgetInit.locale === 'de'
            ? de
            : undefined,
      });
      acc.push({
        ...trans,
        dateDifference,
      });
      return acc;
    }, []);
  }

  onPageChange(page: number) {
    this.transactionsService.pageIndex = page - 1;
    this.transactionsService.getWalletTransactionsByAffectedPaginated().subscribe();
  }

  ngOnDestroy(): void {
    this.transactions = null;
    this.transactionsService.walletTransactions$ = null;
    this.transactionsService.pageIndex = 0;
    this.playerService.currentPage$ = 1;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
