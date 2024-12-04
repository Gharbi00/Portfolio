import { find, map, sortBy } from 'lodash';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { PlayerService } from '../../player.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import {
  LoyaltySettingsType,
  ReputationWithoutTargetType,
  WalletWithReputationDtoType,
  CurrentUserReputationsLossDateType,
  WidgetVisualsType,
  PictureType,
} from '@sifca-monorepo/widget-generator';

@Component({
  selector: 'app-reputation',
  templateUrl: './reputation.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/emoji/picker.css';
      @import '${BASE_URL}/assets/css/swiper/swiper-bundle.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      .ql-container.ql-snow {
        border: 0px !important;
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

      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
      }

      .displayed-center {
        display: flex !important;
        justify-content: center !important;
      }

      .accordion-undisplayed {
        display: none;
      }

      .level-24 .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .level-24 .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .level-24 .timeline-information:after {
        content: none;
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

      .active-level {
        width: 50px;
        filter: drop-shadow(2px 4px 6px black) brightness(1.1);
        margin-left: -35%;
      }

      .disabled-level {
        filter: grayscale(1);
        opacity: 0.5;
      }

      .level-display {
        display: flex;
      }

      .level-img {
        margin-right: 4%;
        margin-top: -2%;
      }

      .timeline-information-text {
        font-weight: 500 !important;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .progress-bar-width {
        width: -webkit-fill-available;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }
      .dark-mode {
        .timeline-information:before {
          content: '' !important;
          width: 1px !important;
          height: 100% !important;
          background-color: #2f3749 !important;
          position: absolute !important;
          top: 0 !important;
          left: 6px;
        }
        .timeline-information:after {
          content: '' !important;
          width: 13px !important;
          height: 13px !important;
          border: 4px solid #fff !important;
          border-radius: 50% !important;
          position: absolute !important;
          top: -2px !important;
          left: 0;
        }
        .timeline-information .timeline-information-date {
          color: #9aa4bf !important;
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

        .popup-box .popup-box-body .popup-box-content .widget-box {
          box-shadow: none;
        }
        .popup-box .widget-box .form .form-row {
          padding: 0;
        }

        .quest-item .quest-item-text {
          margin-top: 18px !important;
          color: #9aa4bf !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.4285714286em;
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
        h1,
        h2,
        h3,
        h4,
        h5,
        p a {
          color: #fff!important;
        }
      }
      .rtl {
        .timeline-information:after {
          content: '' !important;
          right: 0 !important;
          left: auto !important;
        }
        .timeline-information:before {
          content: '' !important;
          right: 5px !important;
          left: auto !important;
        }

        .section-banner {
          transform: scaleX(-1) !important;
        }
        .progress-stat-bar {
          transform: scaleX(-1);
        }
        .section-banner-text,
        .section-banner-title {
          transform: scaleX(-1) !important;
        }
        .widget-box .widget-box-settings {
          right: auto !important;
          left: 19px !important;
        }
        .form-input-decorated .form-input-icon {
          right: auto !important;
          left: 20px !important;
          transform: scaleX(-1);
        }
        .stats-decoration.v2 .percentage-diff,
        .level-progress-box .percentage-diff {
          right: auto !important;
          left: 28px !important;
        }
        .quest-preview .quest-preview-info .quest-preview-image {
          right: 0 !important;
          left: auto !important;
        }
        .quest-preview .quest-preview-info .quest-preview-title,
        .quest-preview .quest-preview-info .quest-preview-text {
          margin-right: 35px;
        }
        @media (min-width: 1200px) {
          .coin-card {
            padding-right: 15px !important;
            padding-left: 0px !important;
          }
          .special-col-margin-2 {
            margin-right: 15px !important;
          }
          .special-col-margin-1 {
            padding-right: 0 !important;
          }

          .special-flex {
            flex: auto !important;
          }
        }
        .form-input-decorated input[type='text'] {
          padding-right: 0px !important;
        }
      }
      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
      }
      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
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
export class ReputationComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  headerImagePath;
  darkMode: boolean;
  baseUrl = BASE_URL;
  isFinalLevel: boolean;
  authenticated: boolean;
  reputationLevels: any[];
  badge1Icon: PictureType;
  badge2Icon: PictureType;
  badge3Icon: PictureType;
  badge4Icon: PictureType;
  badge5Icon: PictureType;
  isValidCountDown: boolean;
  overviewIcon: PictureType;
  currentLevelPercentage: number;
  isPrelevelAccordionClosed = true;
  isAccordionClosed: boolean[] = [];
  wallet: WalletWithReputationDtoType;
  loyaltySettings: LoyaltySettingsType;
  levels: boolean[] = [true, false, false];
  currentLevel: ReputationWithoutTargetType;
  frequencyLossDate: CurrentUserReputationsLossDateType;
  turnoverLossDate: CurrentUserReputationsLossDateType;
  wallet$: Observable<WalletWithReputationDtoType> = this.playerService.wallet$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;

  constructor(private modalService: ModalService, private playerService: PlayerService, private cd: ChangeDetectorRef) {
    this.playerService.authenticated$.pipe(takeUntil(this.unsubscribeAll)).subscribe((authenticated) => {
      this.authenticated = authenticated;
      if (authenticated) {
        this.playerService.userToken$.subscribe((token) => {
          if (token) {
            combineLatest([
              this.playerService.getCurrentUserReputationsLossDate(token),
              this.playerService.getCurrentUserReputationsTurnoverLossDate(token)
            ]).subscribe();
          } else {
            combineLatest([
              this.playerService.getCurrentUserReputationsLossDate(),
              this.playerService.getCurrentUserReputationsTurnoverLossDate()
            ]).subscribe();
          }
        });
        combineLatest([
          this.playerService.wallet$,
          this.playerService.loyaltySettings$,
          this.playerService.currentLevel$,
          this.playerService.currentLevelPercentage$,
          this.playerService.frequencyLossDate$,
          this.playerService.turnoverLossDate$,
          this.playerService.isFinalLevel$,
        ])
          .pipe(takeUntil(this.unsubscribeAll))
          .subscribe(([wallet, loyaltySettings, currentLevel, currentLevelPercentage, lossDate, turnoverLossDate, isFinalLevel]) => {
            this.frequencyLossDate = lossDate;
            this.turnoverLossDate = turnoverLossDate;
            console.log("🚀 ~ ReputationComponent ~ .subscribe ~ turnoverLossDate:", turnoverLossDate)
            this.isFinalLevel = isFinalLevel;
            this.currentLevelPercentage = currentLevelPercentage;
            this.currentLevel = currentLevel;
            this.wallet = wallet;
            this.loyaltySettings = loyaltySettings;
            if (wallet?.reputationLevels) {
              this.reputationLevels = sortBy(wallet?.reputationLevels, (item) => item.rank);
            }
            this.isAccordionClosed = map(this.reputationLevels, (level) => {
              if (this.currentLevel?.levelInterval?.max === level?.levelInterval?.max) {
                return false;
              }
              return true;
            });
            if (!this.currentLevel) {
              this.isPrelevelAccordionClosed = false;
            }
            this.isValidCountDown = this.frequencyLossDate && isAfter(parseISO(this.frequencyLossDate?.lossDate), new Date()) ? true : false;
            this.isValidCountDown = this.frequencyLossDate && isAfter(parseISO(this.frequencyLossDate?.lossDate), new Date()) ? true : true;
            this.cd.markForCheck();
          });
      } else {
        this.playerService.getReputationsByTarget().subscribe((reputationLevels) => {
          this.reputationLevels = sortBy(reputationLevels, (item) => item.rank);
          this.isPrelevelAccordionClosed = false;
        });
      }
    });
  }

  ngOnInit(): void {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.overviewIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_OVERVIEW_ICON').picture;
        this.badge1Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGE_1').picture;
        this.badge2Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGE_2').picture;
        this.badge3Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGE_3').picture;
        this.badge4Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGE_4').picture;
        this.badge5Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGE_5').picture;
        this.cd.markForCheck();
      }
    })
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

  getFrequencyCountdown(): any {
    if (!this.frequencyLossDate?.lossDate) return 0;
    const lossDate = this.frequencyLossDate?.lossDate;
    if (lossDate && isAfter(parseISO(lossDate), new Date())) {
      const questDate = new Date(lossDate);
      const now = new Date();
      const difference = Math.abs(questDate.getTime() - now.getTime());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    } else {
      return 0;
    }
  }

  getLevelAmount(reputationLevels: ReputationWithoutTargetType, index: number): number {
    const walletAmount = +this.wallet.amount;
    const min = reputationLevels.levelInterval.min;
    const max = reputationLevels.levelInterval.max;
    if (index === 0) {
      if (walletAmount >= min && walletAmount <= max) {
        return walletAmount;
      }
      if (walletAmount > max) {
        return max - min;
      }
    } else {
      const prevMax = this.wallet.reputationLevels[index - 1].levelInterval.max;
      if (walletAmount > min && walletAmount <= max) {
        return walletAmount - prevMax;
      }
      if (walletAmount > max) {
        return max - min;
      }
    }
    return 0;
  }

  toggleCollapse(index: number) {
    this.isAccordionClosed[index] = !this.isAccordionClosed[index];
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
