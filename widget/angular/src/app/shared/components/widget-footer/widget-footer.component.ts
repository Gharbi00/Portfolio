import { BASE_URL } from '../../../../environments/environment';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { LeaderboardService } from '../../../modules/player/components/leaderboard/leaderboard.service';
import { ModalService } from '../../services/modal.service';
import { LoyaltySettingsType, PartnershipNetworkType, PointOfSaleType, WalletTypeEnum } from '@sifca-monorepo/widget-generator';
import { PlayerService } from '../../../modules/player/player.service';
import { Observable, Subject, catchError, combineLatest, map, of, take, takeUntil } from 'rxjs';
import { ResetApiService } from '../../services/reset-api.service';
import { NotificationsService } from '../../../modules/player/components/notification/notifications.service';
import { CircularMenuService } from '../../../modules/circular-menu/circular-menu.service';
import { TransactionsService } from '../../../modules/player/components/transactions/transactions.service';

@Component({
  selector: 'widget-footer',
  templateUrl: './widget-footer.component.html',
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

      .position-absolute {
        position: absolute;
      }

      .dark-mode.action-list.dark .action-list-item.active .action-list-item-icon,
      .action-list.dark .action-list-item.unread .action-list-item-icon,
      .action-list.dark .action-list-item:hover .action-list-item-icon {
        fill: #fff;
      }
      .dark-mode.action-list.dark .action-list-item .action-list-item-icon {
        fill: #9b7dff;
      }
      .dark-mode.action-list .action-list-item.active .action-list-item-icon,
      .action-list .action-list-item.unread .action-list-item-icon,
      .action-list .action-list-item:hover .action-list-item-icon {
        fill: #3e3f5e;
      }
      .dark-mode.action-list .action-list-item .action-list-item-icon {
        fill: #dbf5fe !important;
        transition: fill 0.3s ease-in-out;
      }
      @media screen and (max-width: 400px) {
        .floaty-bar .action-list .action-list-item {
          padding: 0 10px !important;
        }
      }
      @media (700px<width<750px) {
        .action-list .action-list-item {
          padding: 0 7px;
        }
      }
      .action-list-item:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }

      .xm-tooltip {
        white-space: nowrap;
        position: absolute;
        z-index: 99999;
        right: -5px;
        bottom: 50px;
        margin-bottom: -12px;
        opacity: 0;
        visibility: hidden;
        transform: translate(0px, 20px);
        transition: all 0.3s ease-in-out;
      }

      .action-list-item:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }
      .action-item:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }

      .action-item-wrap::after {
        display: none !important;
      }
      .dark-mode .dropdown-item.active,
      .dropdown-item:active {
        color: #fff !important;
        background-color: #3a4047 !important;
      }
      .dark-mode .dropdown-item {
        color: #fff !important;
        background-color: #1d2333 !important;
      }
      .dark-mode .dropdown-menu {
        background-color: #1d2333 !important;
      }

      .dropdown-item.active,
      .dropdown-item:active {
        color: #1d2333 !important;
        background-color: #e6e2e2 !important;
      }
      .dropdown-item {
        color: #1d2333 !important;
        background-color: #fff !important;
      }
      .dropdown-menu {
        background-color: #fff !important;
      }

      .avatar-title {
        align-items: center !important;
        display: flex !important;
        font-weight: 500 !important;
        height: 100% !important;
        justify-content: center !important;
        width: 100% !important;
      }

      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info {
        color: #fff !important;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info.negative {
        color: #fff;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info .light {
        color: #9aa4bf;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }
      .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text .light {
        font-size: 12.8px;
        font-weight: 500;
        text-transform: none;
      }

      .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text {
        font-size: 16px;
        font-weight: 700;
      }
      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .appProgressBar {
        border-radius: 2px;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .floaty-bar,
      .floaty-bar .bar-actions {
        align-items: unset;
      }

      .floaty-bar {
        display: flex;
        justify-content: center;
        width: 100.2%;
        background-color: var(--dynamic-color3) !important;
        position: absolute;
        bottom: -2px;
        left: 0;
        z-index: 10000;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }

      @media (width<600px) {
        .floaty-bar {
          bottom: 0% !important;
          width: 100.2% !important;
          left: -1px !important;
        }
      }
      .p-17 {
        padding-top: 17px;
      }
    `,
  ],
})
export class WidgetFooterComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @Input() embed: boolean = false;

  rtl: boolean;
  darkMode: boolean;
  activeModal: string;
  widgetSettings: any;
  isAggregator: boolean;
  showProgress: boolean;
  currentLevelPercentage = 10;
  pos$: Observable<PointOfSaleType> = this.playerService.pos$;
  levelColor$: Observable<string> = this.playerService.levelColor$;
  isFinalLevel$: Observable<boolean> = this.playerService.isFinalLevel$;
  remainingPoints$: Observable<number> = this.playerService.remainingPoints$;
  unreadNotif$: Observable<boolean> = this.notificationsService.unreadNotif$;
  quantitativeWallet$: Observable<any> = this.playerService.quantitativeWallet$;
  partnership$: Observable<PartnershipNetworkType[]> = this.playerService.partnership$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  currentLevelPercentage$: Observable<number> = this.playerService.currentLevelPercentage$;
  messageNotification$: Observable<boolean> = this.circularMenuService.messageNotification$;
  selectedPartner$: Observable<PartnershipNetworkType> = this.playerService.selectedPartner$;

  @HostBinding('style.--dynamic-color') dynamicColor: string = '#ffffff';
  @HostBinding('style.--dynamic-color2') dynamicColor2: string = '#ffffff';
  @HostBinding('style.--dynamic-color3') dynamicColor3: string = '#ffffff';

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private resetApiService: ResetApiService,
    private leaderboardService: LeaderboardService,
    private transactionsService: TransactionsService,
    private circularMenuService: CircularMenuService,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit() {
    combineLatest([this.playerService.pos$, this.playerService.widgetSettings$])
      .pipe(
        takeUntil(this.unsubscribeAll),
        map(([pos, widgetSettings]) => {
          this.widgetSettings = widgetSettings;
          this.dynamicColor = this.widgetSettings?.theme || '#7750f8';
          this.updateColors();
          this.isAggregator = pos?.aggregator;
        }),
      )
      .subscribe(() => {
        this.cd.markForCheck();
      });
    this.playerService.currentLevelPercentage$.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
      this.showProgress = true;
      this.cd.markForCheck();
    });
    this.playerService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.isAggregator = pos?.aggregator;
      this.cd.markForCheck();
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.activeModal$.subscribe((modal) => {
      this.activeModal = modal;
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
  }

  toggleModal(modalName: string): void {
    if (modalName === 'leaderboard') {
      this.leaderboardService.getLiveLeaderboardByCycleForCurrentUserPaginated().subscribe();
    } else if (modalName === 'transactions') {
      this.transactionsService.walletType = WalletTypeEnum.QUANTITATIVE;
      this.transactionsService.getWalletTransactionsByAffectedPaginated().subscribe();
    }
    this.modalService.togglePopUp(modalName, this.element);
  }

  updateColors(): void {
    const colors = this.generateSynergisticColors(this.dynamicColor);
    this.dynamicColor2 = colors.color2;
    this.dynamicColor3 = colors.color3;
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  generateSynergisticColors(mainColor: string): { color2: string; color3: string } {
    const { r, g, b } = this.hexToRgb(mainColor);

    // Adjust values to match #956eff and #5932da more closely
    const color2 = this.rgbToHex(Math.min(255, r + 28), Math.min(255, g + 30), Math.min(255, b + 7));

    const color3 = this.rgbToHex(Math.max(0, r - 18), Math.max(0, g - 18), Math.max(0, b - 30));

    return { color2, color3 };
  }

  switchPos(pos: PartnershipNetworkType) {
    const posId = (window as any).widgetInit.appId;
    this.playerService.selectedPartner$ = pos;
    this.playerService
      .getCurrentUserLinkedCorporateAccountByTarget(pos?.partner?.pos?.id)
      .pipe(
        catchError(() => {
          this.getLoyaltySettingsByAggregator(posId);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (!res?.token) {
          this.getLoyaltySettingsByAggregator(posId);
        } else {
          this.playerService.userToken$ = res?.token;
          this.playerService.connectButton$ = false;
          this.resetApiService.resetData();
        }
      });
  }

  getLoyaltySettingsByAggregator(posId: string) {
    this.playerService.selectedPartner$.pipe(take(1)).subscribe((pos) => {
      this.playerService.findLoyaltySettingsByTarget(pos?.partner?.pos?.id).subscribe((res) => {
        if (res?.aggregator?.target?.pos?.id !== posId) {
          this.playerService.connectButton$ = true;
        } else {
          const timestampInSeconds = Math.floor(Date.now() / 1000).toString();
          this.playerService.linkUserAccount(timestampInSeconds).subscribe((res) => {
            if (res) {
              this.playerService.connectButton$ = false;
              this.cd.markForCheck();
            }
          });
        }
      });
    });
  }
}
